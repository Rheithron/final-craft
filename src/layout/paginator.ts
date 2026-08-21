import { DialogueBlock, ScreenplayElement } from '../fountain/semantic-model';
import {
	ReflowedElement,
	reflowElement,
	ScreenplayLineRole,
} from './reflow';
import { ResolvedRenderProfile } from './profiles';

export interface PageBlock {
	type: ScreenplayElement['type'];
	startLine: number;
	lines: string[];
	roles: ScreenplayLineRole[];
	continued?: boolean;
}

export interface ScreenplayPage {
	number: number;
	usedLines: number;
	blocks: PageBlock[];
}

export function paginate(
	elements: ScreenplayElement[],
	profile: ResolvedRenderProfile,
): ScreenplayPage[] {
	const pages: ScreenplayPage[] = [createPage(1)];
	let previousType: ScreenplayElement['type'] | undefined;

	for (let index = 0; index < elements.length; index++) {
		const element = elements[index];
		if (!element) continue;

		if (element.type === 'page-break') {
			if (currentPage(pages).usedLines > 0) pages.push(createPage(pages.length + 1));
			previousType = undefined;
			continue;
		}

		if (
			element.type === 'act' &&
			element.boundary === 'start' &&
			currentPage(pages).usedLines > 0
		) {
			pages.push(createPage(pages.length + 1));
			previousType = undefined;
		}

		const reflowed = reflowElement(element, profile);
		const reserveAfter = reserveForFollowingActEnd(elements[index + 1]);
		if (element.type === 'action') {
			addSplittableText(
				pages,
				reflowed,
				profile,
				spacingBefore(element.type, previousType),
				reserveAfter,
			);
		} else if (element.type === 'dialogue-block') {
			addDialogue(
				pages,
				element,
				reflowed,
				profile,
				spacingBefore(element.type, previousType),
				reserveAfter,
			);
		} else {
			let spacing = spacingBefore(element.type, previousType);
			const page = currentPage(pages);
			const keepLines =
				element.type === 'act' && element.boundary === 'start'
					? followingActStartKeepLines(elements, index, profile)
					: element.type === 'scene-heading' || element.type === 'shot'
						? followingKeepLines(elements[index + 1], profile)
						: 0;
			if (
				page.usedLines > 0 &&
				spacing + reflowed.lineCount + keepLines + reserveAfter >
					profile.lineCapacity - page.usedLines
			) {
				pages.push(createPage(pages.length + 1));
				spacing = 0;
			}
			addBlock(
				currentPage(pages),
				element.type,
				reflowed.lines,
				reflowed.roles,
				spacing,
			);
		}
		previousType = element.type;
	}

	return pages.filter((page, index) => page.usedLines > 0 || index === 0);
}

function addSplittableText(
	pages: ScreenplayPage[],
	reflowed: ReflowedElement,
	profile: ResolvedRenderProfile,
	initialSpacing: number,
	reserveAfter: number,
) {
	let offset = 0;
	let spacing = initialSpacing;

	while (offset < reflowed.lines.length) {
		let page = currentPage(pages);
		let available = profile.lineCapacity - page.usedLines - spacing;
		if (available < 2 && page.usedLines > 0) {
			pages.push(createPage(pages.length + 1));
			page = currentPage(pages);
			spacing = 0;
			available = profile.lineCapacity;
		}

		const remaining = reflowed.lines.length - offset;
		if (
			reserveAfter > 0 &&
			remaining <= available &&
			remaining + reserveAfter > available &&
			page.usedLines > 0
		) {
			pages.push(createPage(pages.length + 1));
			spacing = 0;
			continue;
		}
		if (remaining + reserveAfter <= available) available -= reserveAfter;
		let take = Math.min(available, remaining);
		if (remaining > take && remaining - take < 2) take = Math.max(2, take - 1);
		if (remaining > take) {
			take = preferSentenceBoundary(reflowed.lines, offset, take);
		}

		addBlock(
			page,
			reflowed.element.type,
			reflowed.lines.slice(offset, offset + take),
			reflowed.roles.slice(offset, offset + take),
			spacing,
			offset > 0,
		);
		offset += take;
		spacing = 0;
		if (offset < reflowed.lines.length) pages.push(createPage(pages.length + 1));
	}
}

function addDialogue(
	pages: ScreenplayPage[],
	element: DialogueBlock,
	reflowed: ReflowedElement,
	profile: ResolvedRenderProfile,
	initialSpacing: number,
	reserveAfter: number,
) {
	const sourceCue = reflowed.lines[0] ?? element.character;
	const content = reflowed.lines.slice(1);
	const contentRoles = reflowed.roles.slice(1);
	let offset = 0;
	let first = true;
	let spacing = initialSpacing;

	while (offset < content.length) {
		let page = currentPage(pages);
		const continuationCue = makeContinuationCue(sourceCue);
		const cue = first ? sourceCue : continuationCue;
		const available = profile.lineCapacity - page.usedLines - spacing;
		const remaining = content.length - offset;
		const minimumContent =
			first && element.content[0]?.type === 'parenthetical' ? 2 : 1;
		if (
			reserveAfter > 0 &&
			1 + remaining <= available &&
			1 + remaining + reserveAfter > available &&
			page.usedLines > 0
		) {
			pages.push(createPage(pages.length + 1));
			spacing = 0;
			continue;
		}
		const fits = 1 + remaining + reserveAfter <= available;

		if (!fits && available < 2 + minimumContent && page.usedLines > 0) {
			pages.push(createPage(pages.length + 1));
			page = currentPage(pages);
			spacing = 0;
			continue;
		}

		if (fits) {
			addBlock(
				page,
				element.type,
				[cue, ...content.slice(offset)],
				['character', ...contentRoles.slice(offset)],
				spacing,
				!first,
			);
			break;
		}

		const contentCapacity = profile.lineCapacity - page.usedLines - spacing - 2;
		const take = Math.max(1, Math.min(contentCapacity, remaining - 1));
		addBlock(
			page,
			element.type,
			[cue, ...content.slice(offset, offset + take), '(MORE)'],
			[
				'character',
				...contentRoles.slice(offset, offset + take),
				'parenthetical',
			],
			spacing,
			!first,
		);
		offset += take;
		first = false;
		spacing = 0;
		pages.push(createPage(pages.length + 1));
	}
}

function addBlock(
	page: ScreenplayPage,
	type: ScreenplayElement['type'],
	lines: string[],
	roles: ScreenplayLineRole[],
	spacing: number,
	continued = false,
) {
	page.usedLines += spacing;
	page.blocks.push({
		type,
		startLine: page.usedLines + 1,
		lines,
		roles,
		...(continued ? { continued } : {}),
	});
	page.usedLines += lines.length;
}

function reserveForFollowingActEnd(element: ScreenplayElement | undefined) {
	return element?.type === 'act' && element.boundary === 'end' ? 2 : 0;
}

function followingKeepLines(
	element: ScreenplayElement | undefined,
	profile: ResolvedRenderProfile,
) {
	if (!element || element.type === 'page-break') return 0;
	return Math.min(2, reflowElement(element, profile).lineCount);
}

function followingActStartKeepLines(
	elements: ScreenplayElement[],
	index: number,
	profile: ResolvedRenderProfile,
) {
	const heading = elements[index + 1];
	const following = elements[index + 2];
	if (!heading || heading.type !== 'scene-heading') return 0;
	return (
		1 +
		reflowElement(heading, profile).lineCount +
		followingKeepLines(following, profile)
	);
}

function spacingBefore(
	type: ScreenplayElement['type'],
	previousType: ScreenplayElement['type'] | undefined,
) {
	if (!previousType) return 0;
	if (type === 'scene-heading' || type === 'shot') {
		return previousType === 'act' ? 1 : 2;
	}
	if (previousType === 'scene-heading' || previousType === 'shot') return 1;
	return 1;
}

function preferSentenceBoundary(lines: string[], offset: number, maximum: number) {
	for (let take = maximum; take >= 2; take--) {
		const line = lines[offset + take - 1];
		if (line && /[.!?…]["')\]]?$/.test(line)) return take;
	}
	return maximum;
}

function makeContinuationCue(cue: string) {
	return /\(CONT'D\)$/i.test(cue) ? cue : cue + " (CONT'D)";
}

function createPage(number: number): ScreenplayPage {
	return { number, usedLines: 0, blocks: [] };
}

function currentPage(pages: ScreenplayPage[]) {
	const page = pages.at(-1);
	if (!page) throw new Error('Paginator has no current page.');
	return page;
}