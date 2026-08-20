const SCENE_ID_PATTERN = /^\d+(?:[a-z]+)?(?:\.(?:\d+[a-z]*|[a-z]+\d*))?$/i;

export function isValidSceneId(value: string) {
	return SCENE_ID_PATTERN.test(value);
}

export function compareSceneIds(left: string, right: string) {
	const leftId = parseSceneId(left);
	const rightId = parseSceneId(right);
	const baseComparison = leftId.base - rightId.base;
	if (baseComparison !== 0) return baseComparison;
	const categoryComparison = leftId.category - rightId.category;
	if (categoryComparison !== 0) return categoryComparison;
	return compareParts(leftId.parts, rightId.parts);
}

interface ParsedSceneId {
	base: number;
	category: number;
	parts: Array<string | number>;
}

function parseSceneId(value: string): ParsedSceneId {
	const match = /^(\d+)([a-z]*)(?:\.(.*))?$/i.exec(value.toLocaleLowerCase());
	const base = Number(match?.[1] ?? 0);
	const suffix = match?.[2] ?? '';
	const dotted = match?.[3];
	if (suffix) return { base, category: 1, parts: [suffix] };
	if (dotted) {
		const parts = (dotted.match(/\d+|[a-z]+/g) ?? []).map((part) =>
			/^\d+$/.test(part) ? Number(part) : part,
		);
		return { base, category: 2, parts };
	}
	return { base, category: 0, parts: [] };
}

function compareParts(left: Array<string | number>, right: Array<string | number>) {
	for (let index = 0; index < Math.max(left.length, right.length); index++) {
		const leftPart = left[index];
		const rightPart = right[index];
		if (leftPart === undefined) return -1;
		if (rightPart === undefined) return 1;
		if (typeof leftPart !== typeof rightPart) {
			return typeof leftPart === 'number' ? -1 : 1;
		}
		const comparison =
			typeof leftPart === 'number' && typeof rightPart === 'number'
				? leftPart - rightPart
				: String(leftPart).localeCompare(String(rightPart));
		if (comparison !== 0) return comparison;
	}
	return 0;
}