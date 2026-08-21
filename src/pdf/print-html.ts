import { ScreenplayPreviewDocument } from '../preview/screenplay-view';

export function renderPrintHtml(document: ScreenplayPreviewDocument) {
	const profile = document.profile;
	const coverValues = [
		document.titlePage.subtitle,
		document.titlePage.episodeTitle,
		document.titlePage.writingCredit,
		...document.titlePage.authors,
	]
		.filter((value): value is string => Boolean(value))
		.map((value) => '<div>' + escapeHtml(value) + '</div>')
		.join('');
	const contactValues = [
		document.titlePage.contactName,
		document.titlePage.contactEmail,
	]
		.filter((value): value is string => Boolean(value))
		.map((value) => '<div>' + escapeHtml(value) + '</div>')
		.join('');
	const titlePage =
		'<section class="page title-page"><div class="title-block">' +
		'<div class="cover-title">' +
		escapeHtml(document.titlePage.title.toUpperCase()) +
		'</div>' +
		coverValues +
		'</div><div class="cover-contact">' +
		contactValues +
		'</div></section>';
	const pages = document.pages.map((page) => {
		const folio =
			page.number > 1
				? '<div class="folio">' + page.number + '.</div>'
				: '';
		const lines = page.blocks.flatMap((block) =>
			block.lines.map((line, index) => {
				const role = block.roles[index];
				if (!role) return '';
				const lineIndex = block.startLine - 1 + index;
				const topPoints = 72 + lineIndex * profile.linePitchPoints;
				return (
					'<div class="line ' +
					role +
					'" style="top:' +
					topPoints.toFixed(5) +
					'pt">' +
					escapeHtml(line) +
					'</div>'
				);
			}),
		);
		return '<section class="page">' + folio + lines.join('') + '</section>';
	});

	return (
		'<!doctype html><html lang="en"><head><meta charset="utf-8">' +
		'<title>' +
		escapeHtml(document.title) +
		'</title><style>' +
		'@page{size:' +
		profile.pageWidthInches +
		'in ' +
		profile.pageHeightInches +
		'in;margin:0}' +
		'html,body{margin:0;padding:0;background:#fff}' +
		'.page{position:relative;box-sizing:border-box;width:' +
		profile.pageWidthInches +
		'in;height:' +
		profile.pageHeightInches +
		'in;overflow:hidden;break-after:page;page-break-after:always;color:#000;background:#fff;font-family:' +
		fontFamily(profile.font) +
		';font-size:12pt;font-weight:400}' +
		'.page:last-child{break-after:auto;page-break-after:auto}' +
		'.title-block{position:absolute;top:3.33in;left:1in;right:1in;text-align:center;line-height:26pt}' +
		'.cover-title{font-weight:400}' +
		'.cover-contact{position:absolute;left:1in;bottom:1.15in;line-height:15pt}' +
		'.line{position:absolute;box-sizing:border-box;height:' +
		profile.linePitchPoints +
		'pt;overflow:hidden;line-height:' +
		profile.linePitchPoints +
		'pt;white-space:pre}' +
		'.action,.scene-heading,.shot{left:1.5in;width:6in}' +
		'.act-start,.act-end{left:1.5in;width:6in;text-align:center}' +
		'.act-start{text-decoration:underline;text-underline-offset:1pt}' +
		'.character{left:3.7in;width:3.8in}' +
		'.dialogue{left:2.5in;width:3.5in}' +
		'.parenthetical{left:3.1in;width:2.5in}' +
		'.transition{left:1.5in;width:6in;text-align:right}' +
		'.folio{position:absolute;top:.5in;right:1in;height:' +
		profile.linePitchPoints +
		'pt;line-height:' +
		profile.linePitchPoints +
		'pt}' +
		'</style></head><body>' +
		titlePage + pages.join('') +
		'</body></html>'
	);
}

function fontFamily(font: ScreenplayPreviewDocument['profile']['font']) {
	switch (font) {
		case 'courier-final-draft':
			return '"Courier Final Draft","Courier Prime","Courier New",monospace';
		case 'courier-new':
			return '"Courier New","Courier Prime",monospace';
		case 'courier-prime':
			return '"Courier Prime","Courier New",monospace';
	}
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}