import { ScreenplayElement } from '../fountain/semantic-model';
import { ResolvedRenderProfile } from './profiles';

export type ScreenplayLineRole =
	| 'action'
	| 'scene-heading'
	| 'shot'
	| 'transition'
	| 'character'
	| 'dialogue'
	| 'parenthetical';

export interface ReflowedElement {
	element: ScreenplayElement;
	lines: string[];
	roles: ScreenplayLineRole[];
	lineCount: number;
}

export function reflowElement(
	element: ScreenplayElement,
	profile: ResolvedRenderProfile,
): ReflowedElement {
	const lines: string[] = [];
	const roles: ScreenplayLineRole[] = [];

	switch (element.type) {
		case 'action':
		case 'scene-heading':
		case 'shot':
		case 'transition': {
			const wrapped = wrapText(element.text, profile.actionWidth);
			lines.push(...wrapped);
			roles.push(...wrapped.map(() => element.type));
			break;
		}
		case 'dialogue-block': {
			const extensions = element.extensions
				.map((extension) => ' (' + extension + ')')
				.join('');
			lines.push(element.character + extensions);
			roles.push('character');
			for (const part of element.content) {
				const width =
					part.type === 'parenthetical'
						? profile.parentheticalWidth
						: profile.dialogueWidth;
				const wrapped = wrapText(part.text, width);
				lines.push(...wrapped);
				roles.push(...wrapped.map(() => part.type));
			}
			break;
		}
		case 'page-break':
			break;
	}

	return { element, lines, roles, lineCount: lines.length };
}

export function wrapText(text: string, width: number) {
	const words = text.trim().split(/\s+/u).filter(Boolean);
	const lines: string[] = [];
	let line = '';

	for (const word of words) {
		for (const part of splitLongWord(word, width)) {
			if (!line) {
				line = part;
			} else if (codePointLength(line) + 1 + codePointLength(part) <= width) {
				line += ' ' + part;
			} else {
				lines.push(line);
				line = part;
			}
		}
	}
	if (line) lines.push(line);
	return lines;
}

function splitLongWord(word: string, width: number) {
	const characters = Array.from(word);
	const parts: string[] = [];
	for (let index = 0; index < characters.length; index += width) {
		parts.push(characters.slice(index, index + width).join(''));
	}
	return parts;
}

function codePointLength(value: string) {
	return Array.from(value).length;
}