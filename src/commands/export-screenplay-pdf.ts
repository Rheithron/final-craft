import { App, Notice, TFile } from 'obsidian';
import { compileProject, FinalCraftCompileError } from '../compiler/compile-project';
import { exportScreenplayPdf } from '../pdf/export-pdf';
import { openScreenplayPreview } from '../preview/screenplay-view';
import { ErrorDetailsModal } from '../ui/error-details-modal';

export async function exportScreenplayToPdf(app: App, file: TFile) {
	try {
		const compiled = await compileProject(app, file);
		await openScreenplayPreview(app, compiled.document);
		const outputPath = await exportScreenplayPdf(app, file, compiled.document);
		new Notice('Final Craft exported PDF to ' + outputPath + (compiled.warnings.length > 0 ? ` with ${compiled.warnings.length} warning${compiled.warnings.length === 1 ? '' : 's'}.` : '.'));
		if (compiled.warnings.length > 0) {
			new ErrorDetailsModal(app, 'Final Craft export warnings', compiled.warnings.join('\n'), 'The PDF was exported. Review or copy these warnings.', 'Copy warnings').open();
		}
	} catch (error) {
		if (error instanceof FinalCraftCompileError) {
			new Notice('Could not compile the screenplay.');
			new ErrorDetailsModal(app, 'PDF export failed', error.message).open();
			return;
		}
		console.error('Final Craft could not export the screenplay PDF.', error);
		const details = error instanceof Error ? error.stack ?? error.name + ': ' + error.message : String(error);
		new ErrorDetailsModal(app, 'PDF export failed', details).open();
	}
}
