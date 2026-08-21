import { App, Notice, TFile } from 'obsidian';
import {
	compileProject,
	FinalCraftCompileError,
} from '../compiler/compile-project';
import { exportScreenplayPdf } from '../pdf/export-pdf';
import { openScreenplayPreview } from '../preview/screenplay-view';
import { ErrorDetailsModal } from '../ui/error-details-modal';

export async function exportScreenplayToPdf(app: App, file: TFile) {
	try {
		const compiled = await compileProject(app, file);
		await openScreenplayPreview(app, compiled.document);
		const outputPath = await exportScreenplayPdf(
			app,
			file,
			compiled.document,
		);
		new Notice('Final Craft exported PDF to ' + outputPath + '.');
	} catch (error) {
		if (error instanceof FinalCraftCompileError) {
			new Notice('Final Craft: ' + error.message);
			return;
		}
		console.error('Final Craft could not export the screenplay PDF.', error);
		const details =
			error instanceof Error
				? error.stack ?? error.name + ': ' + error.message
				: String(error);
		new ErrorDetailsModal(app, 'PDF export failed', details).open();
	}
}