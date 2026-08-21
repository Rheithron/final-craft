import { ScreenplayElement } from '../fountain/semantic-model';
import { ActDefinition } from '../project/master-note';

export function fountainWarnings(path: string, source: string, elements: ScreenplayElement[]) {
	const warnings: string[] = [];
	if (elements.some((element) => element.type === 'dialogue-block' && element.dual)) {
		warnings.push(`${path}: dual dialogue (^) is not supported yet; dialogue will render sequentially.`);
	}
	if (/(^|[^\\])(?:\*\*|\*|_)(?=\S)[^\n]*?(?:\*\*|\*|_)/mu.test(source)) {
		warnings.push(`${path}: Fountain bold, italic, or underline markup is not supported yet; markup characters may remain visible.`);
	}
	if (/^\s*>.+<\s*$/mu.test(source)) warnings.push(`${path}: centered text (>...<) is not supported yet.`);
	if (/^\s*~\S/mu.test(source)) warnings.push(`${path}: Fountain lyrics (~) are not supported yet.`);
	if (/^\s*#{1,6}\s+\S/mu.test(source)) warnings.push(`${path}: Fountain sections (#) are not rendered.`);
	if (/^\s*=(?!=)\s*\S/mu.test(source)) warnings.push(`${path}: Fountain synopsis lines (=) are not rendered.`);
	return warnings;
}

export function removeManualActMarkers(path: string, elements: ScreenplayElement[], acts: Record<string, ActDefinition> | undefined) {
	if (!acts) return { elements, warnings: [] as string[] };
	const labels = new Set(Object.values(acts).flatMap((act) => [normalize(act.start), normalize(act.end)]));
	const warnings: string[] = [];
	const filtered = elements.filter((element) => {
		if (element.type !== 'action' && element.type !== 'shot') return true;
		if (!labels.has(normalize(element.text))) return true;
		warnings.push(`${path}: ignored manual act marker "${element.text}"; act labels come from the master note.`);
		return false;
	});
	return { elements: filtered, warnings };
}

function normalize(value: string) {
	return value.trim().replace(/\s+/g, ' ').toLocaleUpperCase();
}
