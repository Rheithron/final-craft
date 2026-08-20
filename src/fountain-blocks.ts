const marker = String.fromCharCode(96).repeat(3);
const FOUNTAIN_FENCE = new RegExp(
	'^' + marker + '[ \\t]*fountain[ \\t]*\\r?\\n([\\s\\S]*?)^' + marker + '[ \\t]*$',
	'gim',
);

export function extractFountainBlocks(markdown: string) {
	return Array.from(
		markdown.matchAll(FOUNTAIN_FENCE),
		(match) => match[1]?.replace(/\r\n/g, '\n').trimEnd() ?? '',
	);
}