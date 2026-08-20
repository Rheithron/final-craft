import { ScreenplayElement } from '../fountain/semantic-model';
import { ResolvedRenderProfile } from './profiles';

export interface ReflowedElement {
	element: ScreenplayElement;
	lines: string[];
	lineCount: number;
}

export function reflowElement(
	element: ScreenplayElement,
	profile: ResolvedRenderProfile,
): ReflowedElement {
	const lines: string[] = [];

	switch (element.type) {
		case 'action':
		case 'scene-heading':
		case 'shot':
		case 'transition':
			lines.push(...wrapText(element.text, profile.actionWidth));
			break;
		case 'dialogue-block': {
			const extensions = element.extensions
				.map((extension) => ' (' + extension + ')')
				.join('');
			lines.push(element.character + extensions);
			for (const part of element.content) {
				const width =
					part.type === 'parenthetical'
						? profile.parentheticalWidth
						: profile.dialogueWidth;
				lines.push(...wrapText(part.text, width));
			}
			break;
		}
		case 'page-break':
			break;
	}

	return { element, lines, lineCount: lines.length };
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