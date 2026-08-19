import { buildMixedCluePreview } from '$lib/data/clueBlocks';
import { buildModularPuzzlePrompt } from '$lib/data/puzzleModules';
import type { AgeBand, FamilyClue } from '$lib/types/clues';

export type PlayHunt = {
	id: string;
	code: string;
	title: string;
	setting: string;
	ageBand: AgeBand;
	clues: FamilyClue[];
};

const gardenClues: FamilyClue[] = [
	{
		n: 1,
		type: 'word',
		action: 'Look',
		place: 'in the garden',
		discover: 'What colour is it?',
		answer: 'Green',
		puzzle: { number: null, object: null, colour: null, shape: null }
	},
	{
		n: 2,
		type: 'word',
		action: 'Find',
		place: 'by the watering can',
		discover: 'What letter can you see?',
		answer: 'B',
		puzzle: { number: null, object: null, colour: null, shape: null }
	},
	{
		n: 3,
		type: 'puzzle',
		action: '',
		place: '',
		discover: '',
		answer: '',
		puzzle: { number: null, object: 'dog', colour: 'blue', shape: 'circle' }
	},
	{
		n: 4,
		type: 'word',
		action: 'Search',
		place: 'behind the garden bench',
		discover: 'How many are there?',
		answer: '3',
		puzzle: { number: null, object: null, colour: null, shape: null }
	},
	{
		n: 5,
		type: 'puzzle',
		action: '',
		place: '',
		discover: '',
		answer: '',
		puzzle: { number: '2', object: 'cat', colour: 'red', shape: null }
	}
];

const houseClues: FamilyClue[] = [
	{
		n: 1,
		type: 'word',
		action: 'Go to',
		place: 'where we keep the shoes',
		discover: 'What colour is it?',
		answer: 'Red',
		puzzle: { number: null, object: null, colour: null, shape: null }
	},
	{
		n: 2,
		type: 'puzzle',
		action: '',
		place: '',
		discover: '',
		answer: '',
		puzzle: { number: null, object: 'bird', colour: 'yellow', shape: 'star' }
	},
	{
		n: 3,
		type: 'word',
		action: 'Check',
		place: 'under the sofa',
		discover: 'What shape is it?',
		answer: 'Square',
		puzzle: { number: null, object: null, colour: null, shape: null }
	},
	{
		n: 4,
		type: 'word',
		action: 'Look',
		place: 'in the toy box',
		discover: 'What animal is it?',
		answer: 'Cat',
		puzzle: { number: null, object: null, colour: null, shape: null }
	}
];

const demoClues: FamilyClue[] = [
	gardenClues[0],
	houseClues[1],
	gardenClues[2]
];

export const sampleHunts: PlayHunt[] = [
	{
		id: 'hunt-1',
		code: 'GARDEN',
		title: 'Birthday Garden Quest',
		setting: 'Garden',
		ageBand: '3-5',
		clues: gardenClues
	},
	{
		id: 'hunt-2',
		code: 'HOUSE',
		title: 'Rainy Day House Hunt',
		setting: 'House',
		ageBand: '3-5',
		clues: houseClues
	},
	{
		id: 'demo',
		code: 'DEMO',
		title: 'Treasure Demo Hunt',
		setting: 'Home & garden',
		ageBand: '3-5',
		clues: demoClues
	}
];

export const getHuntByCode = (code: string): PlayHunt | undefined =>
	sampleHunts.find((hunt) => hunt.code.toLowerCase() === code.toLowerCase());

export const getHuntById = (id: string): PlayHunt | undefined =>
	sampleHunts.find((hunt) => hunt.id === id);

export const getCluePrompt = (clue: FamilyClue): string => {
	if (clue.type === 'puzzle') {
		return buildModularPuzzlePrompt(clue.puzzle);
	}
	return buildMixedCluePreview(clue.action, clue.place, clue.discover);
};

export type ClueDisplay =
	| { type: 'word'; lead: string; question: string }
	| { type: 'puzzle'; instruction: string; target: string };

export const getClueDisplay = (clue: FamilyClue): ClueDisplay => {
	if (clue.type === 'puzzle') {
		const prompt = buildModularPuzzlePrompt(clue.puzzle);
		const target = prompt.replace(/^Select the /i, '').trim();
		return {
			type: 'puzzle',
			instruction: 'Find the picture',
			target: target || prompt
		};
	}

	const lead = [clue.action.trim(), clue.place.trim()].filter(Boolean).join(' ');
	return {
		type: 'word',
		lead,
		question: clue.discover.trim()
	};
};

export const normaliseAnswer = (value: string): string => value.trim().toLowerCase();

export const answersMatch = (given: string, expected: string): boolean =>
	normaliseAnswer(given) === normaliseAnswer(expected);
