import { DialogueBlock, ScreenplayElement } from './semantic-model';

const HEADING = /^(?:INT|EXT|EST|INT\.\/EXT|EXT\.\/INT|INT\/EXT|EXT\/INT|I\/E)(?:\.|\s)/i;
const TRANSITION = /^[A-Z0-9 .,'’ -]+TO:$/u;
const SHOT = /^(?:ANGLE ON|CLOSE ON|EXTREME CLOSE ON|INSERT|POV|BACK TO SCENE)\b/;
const CUE = /^[\p{Lu}\p{Lt}0-9][\p{Lu}\p{Lt}0-9 .,'’\-()]*$/u;

export function parseFountain(source: string): ScreenplayElement[] {
	const lines = source
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/\[\[[\s\S]*?\]\]/g, '')
		.replace(/\r\n?/g, '\n')
		.split('\n');
	const elements: ScreenplayElement[] = [];
	let index = 0;

	while (index < lines.length) {
		const line = (lines[index] ?? '').trim();
		if (!line) {
			index++;
			continue;
		}
		if (/^={3,}$/.test(line)) {
			elements.push({ type: 'page-break' });
			index++;
			continue;
		}
		const heading = readHeading(line);
		if (heading) {
			elements.push(heading);
			index++;
			continue;
		}
		const transition = readTransition(line);
		if (transition) {
			elements.push(transition);
			index++;
			continue;
		}
		if (SHOT.test(line)) {
			elements.push({ type: 'shot', text: line });
			index++;
			continue;
		}
		const dialogue = readDialogue(lines, index);
		if (dialogue) {
			elements.push(dialogue.block);
			index = dialogue.next;
			continue;
		}

		const forced = line.startsWith('!');
		const action = [forced ? line.slice(1).trimStart() : line];
		index++;
		while (index < lines.length) {
			const next = (lines[index] ?? '').trim();
			if (!next || startsElement(lines, index)) break;
			action.push(next);
			index++;
		}
		elements.push({ type: 'action', text: action.join(' '), forced });
	}
	return elements;
}

function readHeading(line: string) {
	if (line.startsWith('.') && !line.startsWith('..')) {
		return { type: 'scene-heading' as const, text: line.slice(1).trim(), forced: true };
	}
	if (HEADING.test(line)) {
		return { type: 'scene-heading' as const, text: line, forced: false };
	}
	return undefined;
}

function readTransition(line: string) {
	if (line.startsWith('>') && !line.endsWith('<')) {
		return { type: 'transition' as const, text: line.slice(1).trim(), forced: true };
	}
	if (TRANSITION.test(line)) {
		return { type: 'transition' as const, text: line, forced: false };
	}
	return undefined;
}

function readDialogue(lines: string[], index: number) {
	const raw = (lines[index] ?? '').trim();
	const forced = raw.startsWith('@');
	let cue = forced ? raw.slice(1).trim() : raw;
	const dual = cue.endsWith('^');
	if (dual) cue = cue.slice(0, -1).trim();
	const nextLine = (lines[index + 1] ?? '').trim();
	if ((!forced && !CUE.test(cue)) || !nextLine || isControl(nextLine)) return undefined;

	const extensions = Array.from(cue.matchAll(/\(([^)]+)\)/g), (match) =>
		(match[1] ?? '').trim(),
	);
	const content: DialogueBlock['content'] = [];
	let next = index + 1;
	while (next < lines.length) {
		const text = (lines[next] ?? '').trim();
		if (!text) break;
		content.push(
			/^\(.+\)$/.test(text)
				? { type: 'parenthetical', text }
				: { type: 'dialogue', text },
		);
		next++;
	}
	return {
		block: {
			type: 'dialogue-block' as const,
			character: cue.replace(/\s*\([^)]+\)/g, '').trim(),
			extensions,
			forced,
			dual,
			content,
		},
		next,
	};
}

function startsElement(lines: string[], index: number) {
	const line = (lines[index] ?? '').trim();
	return isControl(line) || SHOT.test(line) || Boolean(readDialogue(lines, index));
}

function isControl(line: string) {
	return /^={3,}$/.test(line) || Boolean(readHeading(line)) || Boolean(readTransition(line));
}