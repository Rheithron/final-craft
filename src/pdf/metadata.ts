import { PDFDocument, PDFName } from 'pdf-lib';
import { ScreenplayPdfMetadata } from '../preview/screenplay-view';

const FINAL_CRAFT_XMP_NAMESPACE =
	'https://github.com/Rheithron/final-craft/ns/1.0/';

export async function addPdfMetadata(
	data: Uint8Array,
	metadata: ScreenplayPdfMetadata,
) {
	const pdf = await PDFDocument.load(data, { updateMetadata: false });
	pdf.setTitle(metadata.title, { showInWindowTitleBar: true });
	if (metadata.author) pdf.setAuthor(metadata.author);
	if (metadata.subject) pdf.setSubject(metadata.subject);
	if (metadata.keywords.length > 0) pdf.setKeywords(metadata.keywords);
	pdf.setCreator(metadata.creator ?? 'Final Craft');
	pdf.setProducer('Final Craft');
	if (metadata.language) pdf.setLanguage(metadata.language);
	const now = new Date();
	pdf.setCreationDate(now);
	pdf.setModificationDate(now);

	const xmp = renderXmp(metadata, now);
	const stream = pdf.context.stream(new TextEncoder().encode(xmp), {
		Type: 'Metadata',
		Subtype: 'XML',
	});
	pdf.catalog.set(PDFName.of('Metadata'), pdf.context.register(stream));
	return pdf.save();
}

function renderXmp(metadata: ScreenplayPdfMetadata, date: Date) {
	const title = escapeXml(metadata.title);
	const author = metadata.author
		? `<dc:creator><rdf:Seq><rdf:li>${escapeXml(metadata.author)}</rdf:li></rdf:Seq></dc:creator>`
		: '';
	const subject = metadata.subject
		? `<dc:description><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(metadata.subject)}</rdf:li></rdf:Alt></dc:description>`
		: '';
	const keywords = metadata.keywords
		.map((keyword) => `<rdf:li>${escapeXml(keyword)}</rdf:li>`)
		.join('');
	const keywordMetadata = keywords
		? `<dc:subject><rdf:Bag>${keywords}</rdf:Bag></dc:subject><pdf:Keywords>${escapeXml(metadata.keywords.join('; '))}</pdf:Keywords>`
		: '';
	const language = metadata.language
		? `<dc:language><rdf:Bag><rdf:li>${escapeXml(metadata.language)}</rdf:li></rdf:Bag></dc:language>`
		: '';
	const contactEmail = metadata.contactEmail
		? `<finalCraft:contactEmail>${escapeXml(metadata.contactEmail)}</finalCraft:contactEmail>`
		: '';
	const timestamp = date.toISOString();
	return (
		'<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>' +
		'<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Final Craft">' +
		'<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' +
		'<rdf:Description rdf:about="" ' +
		'xmlns:dc="http://purl.org/dc/elements/1.1/" ' +
		'xmlns:pdf="http://ns.adobe.com/pdf/1.3/" ' +
		'xmlns:xmp="http://ns.adobe.com/xap/1.0/" ' +
		`xmlns:finalCraft="${FINAL_CRAFT_XMP_NAMESPACE}">` +
		`<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${title}</rdf:li></rdf:Alt></dc:title>` +
		author +
		subject +
		keywordMetadata +
		language +
		`<pdf:Producer>Final Craft</pdf:Producer>` +
		`<xmp:CreatorTool>${escapeXml(metadata.creator ?? 'Final Craft')}</xmp:CreatorTool>` +
		`<xmp:CreateDate>${timestamp}</xmp:CreateDate>` +
		`<xmp:ModifyDate>${timestamp}</xmp:ModifyDate>` +
		contactEmail +
		'</rdf:Description></rdf:RDF></x:xmpmeta>' +
		'<?xpacket end="w"?>'
	);
}

function escapeXml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}