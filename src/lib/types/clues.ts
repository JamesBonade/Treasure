export type AgeBand = '3-5' | '5-8' | '8-12';

export type ClueType = 'word' | 'puzzle';

export type PuzzleFacet = 'number' | 'object' | 'colour' | 'shape';

export type PuzzleModules = {
	number: string | null;
	object: string | null;
	colour: string | null;
	shape: string | null;
};

export type FamilyClue = {
	n: number;
	type: ClueType;
	action: string;
	place: string;
	discover: string;
	answer: string;
	puzzle: PuzzleModules;
};

export type ClueChangeDetail = {
	type: ClueType;
	action: string;
	place: string;
	discover: string;
	answer: string;
	puzzle: PuzzleModules;
};

export const emptyPuzzleModules = (): PuzzleModules => ({
	number: null,
	object: null,
	colour: null,
	shape: null
});
