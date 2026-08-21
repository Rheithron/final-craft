import { Font } from '../project/master-note';

export function screenplayFontFamily(font: Font) {
	switch (font) {
		case 'courier-final-draft':
			return '"Courier Final Draft", "Courier Prime", "Courier New", monospace';
		case 'courier-new':
			return '"Courier New", "Courier Prime", monospace';
		case 'courier-prime':
			return '"Courier Prime", "Courier New", monospace';
	}
}

export function screenplayPrimaryFont(font: Font) {
	switch (font) {
		case 'courier-final-draft':
			return 'Courier Final Draft';
		case 'courier-new':
			return 'Courier New';
		case 'courier-prime':
			return 'Courier Prime';
	}
}

export async function isScreenplayFontAvailable(font: Font) {
	const name = screenplayPrimaryFont(font);
	try {
		await new FontFace('Final Craft font probe', `local("${name}")`).load();
		return true;
	} catch {
		return false;
	}
}
