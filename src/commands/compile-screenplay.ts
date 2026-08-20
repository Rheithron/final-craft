import { App, Notice, TFile } from 'obsidian';
import { parseFountain } from '../fountain/parser';
import { parseMasterNote } from '../project/master-note';
import { resolveScenes } from '../project/scene-resolver';

export async function compileScreenplay(app: App, file: TFile) {
	try {
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

		let blockCount = 0;
		let elementCount = 0;
		for (const scene of resolution.scenes) {
			blockCount += scene.fountainBlocks.length;
			for (const block of scene.fountainBlocks) {
				elementCount += parseFountain(block).length;
			}
		}

		new Notice(
			'Final Craft resolved ' +
				resolution.scenes.length +
				' scenes, ' +
				blockCount +
				' Fountain blocks, and ' +
				elementCount +
				' semantic elements for "' +
				result.project.title +
				'" (' +
				resolution.warnings.length +
				' warnings).',
		);
	} catch (error) {
		console.error('Final Craft could not compile the active note.', error);
		new Notice('Could not compile the active note.');
	}
}