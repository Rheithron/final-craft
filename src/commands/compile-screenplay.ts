import { App, Notice, TFile } from 'obsidian';
import { parseMasterNote } from '../project/master-note';

export async function compileScreenplay(app: App, file: TFile) {
	try {
		const source = await app.vault.cachedRead(file);
		const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
		const result = parseMasterNote(frontmatter);

		if (!result.ok) {
			new Notice(`Final Craft: ${result.errors.join(' ')}`);
			return;
		}

		new Notice(
			`Final Craft validated "${result.project.title}" from "${file.basename}" (${source.length} characters).`,
		);
	} catch (error) {
		console.error('Final Craft could not read the active note.', error);
		new Notice('Could not read the active note.');
	}
}