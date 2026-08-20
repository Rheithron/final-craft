import { Density, Font, Paper } from '../project/master-note';

const CAPACITIES: Record<Paper, Record<Density, number>> = {
	letter: { loose: 49, normal: 54, tight: 58, 'very-tight': 64 },
	a4: { loose: 53, normal: 58, tight: 62, 'very-tight': 69 },
};

const PITCHES: Record<Paper, Record<Density, number>> = {
	letter: {
		loose: 13.22449,
		normal: 12,
		tight: 11.17241,
		'very-tight': 10.125,
	},
	a4: {
		loose: 13.16773,
		normal: 12.03258,
		tight: 11.25629,
		'very-tight': 10.11434,
	},
};

export interface ResolvedRenderProfile {
	paper: Paper;
	density: Density;
	font: Font;
	fontSizePoints: 12;
	pageWidthInches: number;
	pageHeightInches: number;
	lineCapacity: number;
	linePitchPoints: number;
	actionWidth: 60;
	dialogueWidth: 35;
	parentheticalWidth: 25;
}

export function resolveRenderProfile(
	paper: Paper,
	density: Density,
	font: Font,
): ResolvedRenderProfile {
	return {
		paper,
		density,
		font,
		fontSizePoints: 12,
		pageWidthInches: paper === 'letter' ? 8.5 : 8.267717,
		pageHeightInches: paper === 'letter' ? 11 : 11.692913,
		lineCapacity: CAPACITIES[paper][density],
		linePitchPoints: PITCHES[paper][density],
		actionWidth: 60,
		dialogueWidth: 35,
		parentheticalWidth: 25,
	};
}