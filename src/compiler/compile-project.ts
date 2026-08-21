import { App, TFile } from 'obsidian';
import { parseFountain } from '../fountain/parser';
import { ScreenplayElement } from '../fountain/semantic-model';
import { isScreenplayFontAvailable, screenplayPrimaryFont } from '../layout/fonts';
import { paginate } from '../layout/paginator';
import { resolveRenderProfile } from '../layout/profiles';
import { ScreenplayPreviewDocument } from '../preview/screenplay-view';
import { parseMasterNote } from '../project/master-note';
import { resolveScenes } from '../project/scene-resolver';
import { fountainWarnings, removeManualActMarkers } from './fountain-diagnostics';

export interface CompiledProject {
	document: ScreenplayPreviewDocument;
	sceneCount: number;
	blockCount: number;
	elementCount: number;
	warnings: string[];
}

export class FinalCraftCompileError extends Error {}

export async function compileProject(
	app: App,
	file: TFile,
): Promise<CompiledProject> {
	const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
	const master = parseMasterNote(frontmatter);
	if (!master.ok) {
		throw new FinalCraftCompileError(master.errors.join(' '));
	}

	const resolution = await resolveScenes(app, master.project);
	if (!resolution.ok) {
		throw new FinalCraftCompileError(resolution.errors.join(' '));
	}

	const elements: ScreenplayElement[] = [];
	const warnings = [...resolution.warnings];
	let blockCount = 0;
	let currentAct: string | undefined;
	const closedActs = new Set<string>();
	for (const scene of resolution.scenes) {
		if (master.project.acts && scene.act !== currentAct) {
			if (currentAct) {
				elements.push({
					type: 'act',
					text: master.project.acts[currentAct]?.end ?? currentAct,
					boundary: 'end',
				});
				closedActs.add(currentAct);
			}
			currentAct = scene.act;
			if (currentAct) {
				if (closedActs.has(currentAct)) {
					throw new FinalCraftCompileError(
						`Act ${currentAct} is not contiguous in scene order.`,
					);
				}
				elements.push({
					type: 'act',
					text: master.project.acts[currentAct]?.start ?? currentAct,
					boundary: 'start',
				});
			}
		}
		blockCount += scene.fountainBlocks.length;
		for (const block of scene.fountainBlocks) {
			const parsed = parseFountain(block);
			warnings.push(...fountainWarnings(scene.path, block, parsed));
			const cleaned = removeManualActMarkers(scene.path, parsed, master.project.acts);
			warnings.push(...cleaned.warnings);
			elements.push(...cleaned.elements);
		}
	}
	if (master.project.acts && currentAct) {
		elements.push({
			type: 'act',
			text: master.project.acts[currentAct]?.end ?? currentAct,
			boundary: 'end',
		});
	}

	const profile = resolveRenderProfile(
		master.project.paper,
		master.project.density,
		master.project.font,
	);
	if (!(await isScreenplayFontAvailable(profile.font))) {
		warnings.push(
			`Selected font "${screenplayPrimaryFont(profile.font)}" is unavailable. A fallback font will be used, so line and page breaks may differ.`,
		);
	}

	return {
		document: {
			title: master.project.title,
			metadata: {
				title: master.project.pdfTitle ?? master.project.title,
				...(master.project.authors.length > 0
					? { author: master.project.authors.join(', ') }
					: {}),
				...(master.project.subject ? { subject: master.project.subject } : {}),
				keywords: master.project.keywords,
				...(master.project.creator ? { creator: master.project.creator } : {}),
				...(master.project.language ? { language: master.project.language } : {}),
				...(master.project.contact?.email
					? { contactEmail: master.project.contact.email }
					: {}),
			},
			titlePage: {
				title: master.project.title,
				...(master.project.subtitle ? { subtitle: master.project.subtitle } : {}),
				...(master.project.episodeTitle
					? { episodeTitle: master.project.episodeTitle }
					: {}),
				...(master.project.writingCredit
					? { writingCredit: master.project.writingCredit }
					: {}),
				authors: master.project.authors,
				...(master.project.contact?.name
					? { contactName: master.project.contact.name }
					: {}),
				...(master.project.contact?.email
					? { contactEmail: master.project.contact.email }
					: {}),
			},
			pages: paginate(elements, profile),
			profile,
		},
		sceneCount: resolution.scenes.length,
		blockCount,
		elementCount: elements.length,
		warnings,
	};
}