export const PAPER_VALUES = ['letter', 'a4'] as const;
export const DENSITY_VALUES = [
	'loose',
	'normal',
	'tight',
	'very-tight',
] as const;
export const FONT_VALUES = [
	'courier-prime',
	'courier-final-draft',
	'courier-new',
] as const;

export type Paper = (typeof PAPER_VALUES)[number];
export type Density = (typeof DENSITY_VALUES)[number];
export type Font = (typeof FONT_VALUES)[number];

export interface ActDefinition {
	start: string;
	end: string;
}

export interface ContactDetails {
	name?: string;
	email?: string;
}

export interface MasterProject {
	title: string;
	subtitle?: string;
	episodeTitle?: string;
	writingCredit?: string;
	authors: string[];
	contact?: ContactDetails;
	pdfTitle?: string;
	subject?: string;
	keywords: string[];
	creator?: string;
	language?: string;	sourceFolder: string;
	paper: Paper;
	density: Density;
	font: Font;
	acts?: Record<string, ActDefinition>;
}

export type MasterNoteResult =
	| { ok: true; project: MasterProject }
	| { ok: false; errors: string[] };

export function parseMasterNote(value: unknown): MasterNoteResult {
	if (!isRecord(value)) {
		return { ok: false, errors: ['The active note has no YAML properties.'] };
	}

	const errors: string[] = [];

	if (value.final_craft !== true) {
		errors.push('Set final_craft: true in the active note.');
	}

	const title = readRequiredString(value, 'title', errors);
	const sourceFolder = readRequiredString(value, 'source_folder', errors);
	const paper = readChoice(value, 'paper', PAPER_VALUES, errors);
	const density = readChoice(value, 'density', DENSITY_VALUES, errors);
	const font = readChoice(value, 'font', FONT_VALUES, errors);
	const authors = readAuthors(value.authors, errors);
	const contact = readContact(value.contact, errors);
	const keywords = readStringList(value.keywords, 'keywords', errors);
	const acts = readActs(value.acts, errors);

	if (errors.length > 0 || !title || !sourceFolder || !paper || !density || !font) {
		return { ok: false, errors };
	}

	return {
		ok: true,
		project: {
			title,
			subtitle: readOptionalString(value.subtitle),
			episodeTitle: readOptionalString(value.episode_title),
			writingCredit: readOptionalString(value.writing_credit),
			authors,
			...(contact ? { contact } : {}),
			...(readOptionalString(value.pdf_title)
				? { pdfTitle: readOptionalString(value.pdf_title) }
				: {}),
			...(readOptionalString(value.subject)
				? { subject: readOptionalString(value.subject) }
				: {}),
			keywords,
			...(readOptionalString(value.creator)
				? { creator: readOptionalString(value.creator) }
				: {}),
			...(readOptionalString(value.language)
				? { language: readOptionalString(value.language) }
				: {}),
			sourceFolder,
			paper,
			density,
			font,
			...(acts ? { acts } : {}),
		},
	};
}

function readStringList(value: unknown, key: string, errors: string[]) {
	if (value === undefined) return [];
	if (
		!isUnknownArray(value) ||
		value.some((item) => typeof item !== 'string' || !item.trim())
	) {
		errors.push(`Property ${key} must be a list of non-empty strings.`);
		return [];
	}
	return value.map((item) => (item as string).trim());
}

function readContact(value: unknown, errors: string[]) {
	if (value === undefined) {
		return undefined;
	}
	if (!isRecord(value)) {
		errors.push('Property contact must be a mapping with name and/or email.');
		return undefined;
	}

	const name = readOptionalString(value.name);
	const email = readOptionalString(value.email);
	if (!name && !email) {
		errors.push('Property contact must define a non-empty name and/or email.');
		return undefined;
	}
	return { ...(name ? { name } : {}), ...(email ? { email } : {}) };
}

function readRequiredString(
	value: Record<string, unknown>,
	key: string,
	errors: string[],
) {
	const result = readOptionalString(value[key]);
	if (!result) {
		errors.push(`Property ${key} must be a non-empty string.`);
	}
	return result;
}

function readOptionalString(value: unknown) {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readChoice<const T extends readonly string[]>(
	value: Record<string, unknown>,
	key: string,
	choices: T,
	errors: string[],
): T[number] | undefined {
	const candidate = value[key];
	if (typeof candidate === 'string' && isChoice(candidate, choices)) {
		return candidate;
	}
	errors.push(`Property ${key} must be one of: ${choices.join(', ')}.`);
	return undefined;
}

function readAuthors(value: unknown, errors: string[]) {
	if (value === undefined) {
		return [];
	}
	if (!isUnknownArray(value)) {
		errors.push('Property authors must be a list of non-empty strings.');
		return [];
	}

	const authors: string[] = [];
	for (const author of value) {
		if (typeof author !== 'string' || !author.trim()) {
			errors.push('Property authors must be a list of non-empty strings.');
			return [];
		}
		authors.push(author.trim());
	}
	return authors;
}

function readActs(value: unknown, errors: string[]) {
	if (value === undefined) {
		return undefined;
	}
	if (!isRecord(value) || Object.keys(value).length === 0) {
		errors.push('Property acts must be a non-empty mapping when provided.');
		return undefined;
	}

	const acts: Record<string, ActDefinition> = {};
	for (const [key, definition] of Object.entries(value)) {
		if (!isRecord(definition)) {
			errors.push(`Act ${key} must define start and end labels.`);
			continue;
		}
		const start = readOptionalString(definition.start);
		const end = readOptionalString(definition.end);
		if (!start || !end) {
			errors.push(`Act ${key} must define non-empty start and end labels.`);
			continue;
		}
		acts[key] = { start, end };
	}

	return Object.keys(acts).length > 0 ? acts : undefined;
}

function isChoice<const T extends readonly string[]>(
	value: string,
	choices: T,
): value is T[number] {
	return choices.some((choice) => choice === value);
}

function isUnknownArray(value: unknown): value is unknown[] {
	return Array.isArray(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}