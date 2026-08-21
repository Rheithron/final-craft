import { App, normalizePath, TFile } from 'obsidian';
import { ScreenplayPreviewDocument } from '../preview/screenplay-view';
import { renderPrintHtml } from './print-html';
import { addPdfMetadata } from './metadata';

interface PrintToPdfOptions {
	printBackground: boolean;
	preferCSSPageSize: boolean;
	pageSize: { width: number; height: number };
	margins: { top: number; bottom: number; left: number; right: number };
}

interface PdfWebviewElement extends HTMLElement {
	printToPDF(options: PrintToPdfOptions): Promise<Uint8Array>;
}

declare global {
	interface HTMLElementTagNameMap {
		webview: PdfWebviewElement;
	}
}

export async function exportScreenplayPdf(
	app: App,
	masterFile: TFile,
	document: ScreenplayPreviewDocument,
) {
	const webview = activeDocument.createElementNS(
		'http://www.w3.org/1999/xhtml',
		'webview',
	) as PdfWebviewElement;
	webview.classList.add('final-craft-pdf-webview');
	activeDocument.body.appendChild(webview);

	try {
		const loaded = waitForLoad(webview);
		const html = renderPrintHtml(document);
		webview.setAttribute(
			'src',
			'data:text/html;charset=utf-8,' + encodeURIComponent(html),
		);
		await loaded;

		if (typeof webview.printToPDF !== 'function') {
			throw new Error('Electron PDF printing is unavailable in this Obsidian build.');
		}

		const data = await webview.printToPDF({
			printBackground: true,
			preferCSSPageSize: true,
			pageSize: {
				width: document.profile.pageWidthInches,
				height: document.profile.pageHeightInches,
			},
			margins: { top: 0, bottom: 0, left: 0, right: 0 },
		});
		const outputPath = await availableOutputPath(
			app,
			masterFile,
			document.title,
		);
		const copy = Uint8Array.from(
			await addPdfMetadata(Uint8Array.from(data), document.metadata),
		);
		await app.vault.createBinary(outputPath, copy.buffer);
		return outputPath;
	} finally {
		webview.remove();
	}
}

function waitForLoad(webview: PdfWebviewElement) {
	return new Promise<void>((resolve, reject) => {
		const timeout = window.setTimeout(() => {
			reject(new Error('Timed out while preparing the PDF renderer.'));
		}, 15_000);

		webview.addEventListener(
			'did-finish-load',
			() => {
				window.clearTimeout(timeout);
				resolve();
			},
			{ once: true },
		);
		webview.addEventListener(
			'did-fail-load',
			() => {
				window.clearTimeout(timeout);
				reject(new Error('Chromium could not load the screenplay for PDF export.'));
			},
			{ once: true },
		);
	});
}

async function availableOutputPath(
	app: App,
	masterFile: TFile,
	title: string,
) {
	const directory = masterFile.parent?.path ?? '';
	const basename = sanitizeFilename(title) || 'Screenplay';
	let suffix = 1;

	while (true) {
		const filename =
			basename + (suffix === 1 ? '' : ' ' + suffix) + '.pdf';
		const path = normalizePath(directory ? directory + '/' + filename : filename);
		if (!(await app.vault.adapter.exists(path))) return path;
		suffix++;
	}
}

function sanitizeFilename(value: string) {
	return Array.from(value)
		.filter((character) => (character.codePointAt(0) ?? 0) >= 32)
		.join('')
        .replace(/[<>:"/|?*]/g, '')
        .replaceAll(String.fromCharCode(92), '')
		.replace(/[. ]+$/g, '')
		.trim();
}
