import { buildMixedCluePreview } from '$lib/data/clueBlocks';
import { buildModularPuzzlePrompt } from '$lib/data/puzzleModules';
import { buildTracePrompt } from '$lib/data/traceTargets';
import type { FamilyClue } from '$lib/types/clues';
import type { PlayHunt } from '$lib/types/hunts';

export type { PlayHunt };

export const getCluePrompt = (clue: FamilyClue): string => {
	if (clue.type === 'puzzle') {
		return buildModularPuzzlePrompt(clue.puzzle);
	}
	if (clue.type === 'trace') {
		return buildTracePrompt(clue.traceMode, clue.answer);
	}
	return buildMixedCluePreview(clue.action, clue.place, clue.discover);
};

export type ClueDisplay =
	| { type: 'word'; lead: string; question: string }
	| { type: 'puzzle'; instruction: string; target: string }
	| { type: 'trace'; instruction: string; target: string };

export const getClueDisplay = (clue: FamilyClue): ClueDisplay => {
	if (clue.type === 'puzzle') {
		const prompt = buildModularPuzzlePrompt(clue.puzzle);
		return {
			type: 'puzzle',
			instruction: 'Your clue',
			target: prompt || 'Find the picture'
		};
	}

	if (clue.type === 'trace') {
		const prompt = buildTracePrompt(clue.traceMode, clue.answer);
		return {
			type: 'trace',
			instruction: 'Your clue',
			target: prompt || 'Trace the letters'
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
