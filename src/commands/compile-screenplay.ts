import { App, Notice, TFile } from 'obsidian';

export async function compileScreenplay(app: App, file: TFile) {
	try {
		const source = await app.vault.cachedRead(file);
		new Notice(
			`Final Craft read "${file.basename}" (${source.length} characters).`,
		);
	} catch (error) {
		console.error('Final Craft could not read the active note.', error);
		new Notice('Could not read the active note.');
	}
}