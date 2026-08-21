import { App, Notice, TFile } from 'obsidian';
import { compileProject, FinalCraftCompileError } from '../compiler/compile-project';
import { openScreenplayPreview } from '../preview/screenplay-view';
import { ErrorDetailsModal } from '../ui/error-details-modal';

export async function compileScreenplay(app: App, file: TFile) {
	try {
		const compiled = await compileProject(app, file);
		await openScreenplayPreview(app, compiled.document);
		new Notice('Final Craft compiled ' + compiled.sceneCount + ' scenes into ' + compiled.document.pages.length + ' screenplay pages' + (compiled.warnings.length > 0 ? ` with ${compiled.warnings.length} warning${compiled.warnings.length === 1 ? '' : 's'}.` : '.'));
		if (compiled.warnings.length > 0) {
			new ErrorDetailsModal(app, 'Final Craft compile warnings', compiled.warnings.join('\n'), 'The preview was created. Review or copy these warnings.', 'Copy warnings').open();
		}
	} catch (error) {
		if (error instanceof FinalCraftCompileError) {
			new Notice('Could not compile the screenplay.');
			new ErrorDetailsModal(app, 'Compile failed', error.message).open();
			return;
		}
		console.error('Final Craft could not compile the active note.', error);
		const details = error instanceof Error ? error.stack ?? error.message : String(error);
		new ErrorDetailsModal(app, 'Compile failed', details).open();
	}
}
