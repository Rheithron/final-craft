import { App, Notice, TFile } from 'obsidian';
import {
	compileProject,
	FinalCraftCompileError,
} from '../compiler/compile-project';
import { openScreenplayPreview } from '../preview/screenplay-view';

export async function compileScreenplay(app: App, file: TFile) {
	try {
		const compiled = await compileProject(app, file);
		await openScreenplayPreview(app, compiled.document);
		new Notice(
			'Final Craft compiled ' +
				compiled.sceneCount +
				' scenes into ' +
				compiled.document.pages.length +
				' screenplay pages.',
		);
	} catch (error) {
		if (error instanceof FinalCraftCompileError) {
			new Notice('Final Craft: ' + error.message);
			return;
		}
		console.error('Final Craft could not compile the active note.', error);
		new Notice('Could not compile the active note.');
	}
}