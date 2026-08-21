export type ScreenplayElement =
	| { type: 'scene-heading'; text: string; forced: boolean }
	| { type: 'action'; text: string; forced: boolean }
	| { type: 'shot'; text: string }
	| { type: 'act'; text: string; boundary: 'start' | 'end' }
	| DialogueBlock
	| { type: 'transition'; text: string; forced: boolean }
	| { type: 'page-break' };

export interface DialogueBlock {
	type: 'dialogue-block';
	character: string;
	extensions: string[];
	forced: boolean;
	dual: boolean;
	content: Array<
		| { type: 'dialogue'; text: string }
		| { type: 'parenthetical'; text: string }
	>;
}