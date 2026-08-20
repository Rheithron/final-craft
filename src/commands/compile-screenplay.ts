import { App, Notice, TFile } from 'obsidian';
import { parseFountain } from '../fountain/parser';
import { ScreenplayElement } from '../fountain/semantic-model';
import { paginate } from '../layout/paginator';
import { reflowElement } from '../layout/reflow';
import { resolveRenderProfile } from '../layout/profiles';
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

		const elements: ScreenplayElement[] = [];
		let blockCount = 0;
		for (const scene of resolution.scenes) {
			blockCount += scene.fountainBlocks.length;
			for (const block of scene.fountainBlocks) {
				elements.push(...parseFountain(block));
			}
		}

		const profile = resolveRenderProfile(
			result.project.paper,
			result.project.density,
			result.project.font,
		);
		const reflowedLineCount = elements.reduce(
			(total, element) => total + reflowElement(element, profile).lineCount,
			0,
		);
		const pages = paginate(elements, profile);

		new Notice(
			'Final Craft resolved ' +
				resolution.scenes.length +
				' scenes, ' +
				blockCount +
				' Fountain blocks, ' +
				elements.length +
				' semantic elements, and ' +
				reflowedLineCount +
				' reflowed text lines across ' +
				pages.length +
				' screenplay pages for "' +
				result.project.title +
				'" (' +
				profile.paper +
				', ' +
				profile.density +
				', ' +
				profile.lineCapacity +
				' lines/page).',
		);
	} catch (error) {
		console.error('Final Craft could not compile the active note.', error);
		new Notice('Could not compile the active note.');
	}
}