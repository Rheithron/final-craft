import { App, Notice, TFile } from 'obsidian';
import { parseMasterNote } from '../project/master-note';
import { resolveScenes } from '../project/scene-resolver';

export async function compileScreenplay(app: App, file: TFile) {
	try {
		const source = await app.vault.cachedRead(file);
		const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
		const result = parseMasterNote(frontmatter);

		if (!result.ok) {
			new Notice('Final Craft: ' + result.errors.join(' '));
			return;
		}

		const resolution = await resolveScenes(app, result.project);
		if (!resolution.ok) {
			new Notice('Final Craft: ' + resolution.errors.join(' '));
			return;
		}

		const blockCount = resolution.scenes.reduce(
			(total, scene) => total + scene.fountainBlocks.length,
			0,
		);
		new Notice(
			'Final Craft resolved ' +
				resolution.scenes.length +
				' scenes and ' +
				blockCount +
				' Fountain blocks for "' +
				result.project.title +
				'" (' +
				resolution.warnings.length +
				' warnings, ' +
				source.length +
				' master-note characters).',
		);
	} catch (error) {
		console.error('Final Craft could not read the active note.', error);
		new Notice('Could not read the active note.');
	}
}