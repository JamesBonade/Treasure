export type AgeBand = '3-5' | '5-8' | '8-12';

export type ClueType = 'word' | 'puzzle' | 'trace';

export type PuzzleFacet = 'number' | 'object' | 'colour' | 'shape';

export type PuzzleModules = {
	number: string | null;
	object: string | null;
	colour: string | null;
	shape: string | null;
};

export type TraceMode = 'letter' | 'word';

export type FamilyClue = {
	n: number;
	type: ClueType;
	action: string;
	place: string;
	discover: string;
	answer: string;
	puzzle: PuzzleModules;
	/** For trace clues: 'letter' or 'word'. Empty for other types. */
	traceMode: TraceMode | '';
};

export type ClueChangeDetail = {
	type: ClueType;
	action: string;
	place: string;
	discover: string;
	answer: string;
	puzzle: PuzzleModules;
	traceMode: TraceMode | '';
};

export const emptyPuzzleModules = (): PuzzleModules => ({
	number: null,
	object: null,
	colour: null,
	shape: null
});

export const createEmptyClue = (n: number): FamilyClue => ({
	n,
	type: 'word',
	action: '',
	place: '',
	discover: '',
	answer: '',
	puzzle: emptyPuzzleModules(),
	traceMode: ''
});
