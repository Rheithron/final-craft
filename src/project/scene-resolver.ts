import { App, normalizePath, TFolder } from 'obsidian';
import { extractFountainBlocks } from '../fountain-blocks';
import { MasterProject } from './master-note';
import { compareSceneIds, isValidSceneId } from './scene-order';

export interface SceneSource {
	id: string;
	act?: string;
	path: string;
	fountainBlocks: string[];
}

export type SceneResolution =
	| { ok: true; scenes: SceneSource[]; warnings: string[] }
	| { ok: false; errors: string[] };

export async function resolveScenes(
	app: App,
	project: MasterProject,
): Promise<SceneResolution> {
	const folder = app.vault.getAbstractFileByPath(normalizePath(project.sourceFolder));
	if (!(folder instanceof TFolder)) {
		return { ok: false, errors: ['Source folder "' + project.sourceFolder + '" does not exist.'] };
	}

	const errors: string[] = [];
	const warnings: string[] = [];
	const scenes: SceneSource[] = [];
	const seenIds = new Map<string, string>();
	const pathPrefix = folder.path + '/';

	for (const file of app.vault.getMarkdownFiles()) {
		if (!file.path.startsWith(pathPrefix)) continue;
		const frontmatter: unknown =
			app.metadataCache.getFileCache(file)?.frontmatter;
		const metadata = isRecord(frontmatter) ? frontmatter : {};
		const sceneValue = metadata.scene;
		if (typeof sceneValue !== 'string' || !sceneValue.trim()) {
			errors.push(file.path + ': scene must be a quoted, non-empty string.');
			continue;
		}
		const id = sceneValue.trim();
		if (!isValidSceneId(id)) {
			errors.push(file.path + ': invalid scene identifier "' + id + '".');
			continue;
		}
		const duplicateKey = id.toLocaleLowerCase();
		const duplicatePath = seenIds.get(duplicateKey);
		if (duplicatePath) {
			errors.push('Duplicate scene "' + id + '" in ' + duplicatePath + ' and ' + file.path + '.');
			continue;
		}
		seenIds.set(duplicateKey, file.path);

		const act = readAct(metadata.act);
		if (project.acts && (!act || !(act in project.acts))) {
			errors.push(file.path + ': act must match a key in the master acts map.');
			continue;
		}

		const fountainBlocks = extractFountainBlocks(await app.vault.cachedRead(file));
		if (fountainBlocks.length === 0) warnings.push(file.path + ': no fountain blocks found.');
		scenes.push({ id, ...(act ? { act } : {}), path: file.path, fountainBlocks });
	}

	if (errors.length > 0) return { ok: false, errors };
	scenes.sort((left, right) => compareSceneIds(left.id, right.id));
	return { ok: true, scenes, warnings };
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readAct(value: unknown) {
	if (typeof value === 'string' && value.trim()) return value.trim();
	if (typeof value === 'number' && Number.isFinite(value)) return String(value);
	return undefined;
}