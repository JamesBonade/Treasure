import type { ClueBlock } from '$lib/data/clueBlocks';
import { discoverBlocks } from '$lib/data/clueBlocks';
import {
	numberOptionsAge3to5,
	shapeOptionsAge3to5
} from '$lib/data/puzzleModules';

export type AnswerKind =
	| 'colour'
	| 'number'
	| 'letter'
	| 'word'
	| 'animal'
	| 'shape'
	| 'size'
	| 'parity'
	| 'direction'
	| 'shapeBinary';

const toBlocks = (texts: string[]): ClueBlock[] =>
	texts.map((text, index) => ({ n: index + 1, text }));

export const colourAnswerBlocks = toBlocks([
	'Red',
	'Blue',
	'Green',
	'Yellow',
	'Orange',
	'Purple',
	'Pink',
	'Brown'
]);

export const numberAnswerBlocks = toBlocks([
	...numberOptionsAge3to5.map((option) => option.label),
	'5',
	'6',
	'7',
	'8',
	'9',
	'0'
]);

export const letterAnswerBlocks = toBlocks('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));

export const shapeAnswerBlocks = toBlocks(shapeOptionsAge3to5.map((option) => option.label));

export const animalAnswerBlocks = toBlocks([
	'Dog',
	'Cat',
	'Bird',
	'Fish',
	'Rabbit',
	'Frog',
	'Duck',
	'Butterfly',
	'Elephant',
	'Bear',
	'Horse'
]);

export const wordAnswerBlocks = toBlocks(['Sun', 'Book', 'Door', 'Home', 'Star', 'Stop']);

export const sizeAnswerBlocks = toBlocks(['Big', 'Small']);
export const parityAnswerBlocks = toBlocks(['Odd', 'Even']);
export const directionAnswerBlocks = toBlocks(['Up', 'Down', 'Left', 'Right']);
export const shapeBinaryAnswerBlocks = toBlocks(['Circle', 'Square']);

export const answerBlocksByKind: Record<AnswerKind, ClueBlock[]> = {
	colour: colourAnswerBlocks,
	number: numberAnswerBlocks,
	letter: letterAnswerBlocks,
	word: wordAnswerBlocks,
	animal: animalAnswerBlocks,
	shape: shapeAnswerBlocks,
	size: sizeAnswerBlocks,
	parity: parityAnswerBlocks,
	direction: directionAnswerBlocks,
	shapeBinary: shapeBinaryAnswerBlocks
};

export const freeformAnswerKinds = new Set<AnswerKind>(['colour', 'word', 'animal']);

export const isFreeformAnswerKind = (kind: AnswerKind): boolean => freeformAnswerKinds.has(kind);

export const getAnswerPlaceholderForKind = (kind: AnswerKind): string => {
	if (kind === 'colour') return 'Type a colour…';
	if (kind === 'animal') return 'Type an animal…';
	if (kind === 'word') return 'Type a word…';
	return '';
};

/** Maps each discover phrase to the answer type parents should pick. */
export const discoverAnswerKind: Record<string, AnswerKind> = {
	'What colour is it?': 'colour',
	'What number can you find?': 'number',
	'What letter can you see?': 'letter',
	'What word is written there?': 'word',
	'How many are there?': 'number',
	'What shape is it?': 'shape',
	'What is its name?': 'word',
	'What is the first letter?': 'letter',
	'What is the last letter?': 'letter',
	'What is different?': 'word',
	'What comes next?': 'number',
	'What colour is the {object}?': 'colour',
	'How many {thing}s can you count?': 'number',
	'What letter is on it?': 'letter',
	'Is it big or small?': 'size',
	'What picture do you see?': 'word',
	'What number is written there?': 'number',
	'Which colour is missing?': 'colour',
	'What is the biggest?': 'word',
	'What is the smallest?': 'word',
	'What pattern do you see?': 'word',
	'What animal is it?': 'animal',
	'What sound does it start with?': 'letter',
	'How many letters are there?': 'number',
	'What is the second letter?': 'letter',
	'Which one does not belong?': 'word',
	'What is hiding there?': 'word',
	'What is on top?': 'word',
	'What is underneath?': 'word',
	'Is it an odd or even number?': 'parity',
	'What comes before?': 'number',
	'Can you read the word?': 'word',
	'What two colours do you see?': 'colour',
	'How many corners does it have?': 'number',
	'Is it a circle or a square?': 'shapeBinary',
	'What is the missing number?': 'number',
	'What is the missing letter?': 'letter',
	'Which way is it pointing?': 'direction',
	'What is written in big letters?': 'word',
	'What is next to it?': 'word',
	'Match the colour': 'colour',
	'Match the number': 'number',
	'Match the letter': 'letter',
	'What is the total?': 'number',
	'How many {object}s are there?': 'number',
	'What is the first word?': 'word',
	'What is the last word?': 'word',
	'What {number} do you see?': 'number',
	'What is the same?': 'word',
	'What did you notice first?': 'word'
};

const inferAnswerKind = (discover: string): AnswerKind => {
	const lower = discover.toLowerCase();
	if (lower.includes('animal')) return 'animal';
	if (lower.includes('colour') || lower.includes('color')) return 'colour';
	if (lower.includes('letter') || lower.includes('sound does it start')) return 'letter';
	if (
		lower.includes('number') ||
		lower.includes('how many') ||
		lower.includes('count') ||
		lower.includes('total') ||
		lower.includes('corners')
	) {
		return 'number';
	}
	if (lower.includes('circle or a square')) return 'shapeBinary';
	if (lower.includes('shape')) return 'shape';
	if (lower.includes('big or small')) return 'size';
	if (lower.includes('odd or even')) return 'parity';
	if (lower.includes('pointing')) return 'direction';
	if (lower.includes('word') || lower.includes('name') || lower.includes('read')) return 'word';
	return 'word';
};

export const getAnswerKindForDiscover = (discover: string): AnswerKind => {
	const trimmed = discover.trim();
	if (!trimmed) return discoverAnswerKind[discoverBlocks[0].text] ?? 'colour';
	return discoverAnswerKind[trimmed] ?? inferAnswerKind(trimmed);
};

export const getAnswerBlocksForDiscover = (discover: string): ClueBlock[] =>
	answerBlocksByKind[getAnswerKindForDiscover(discover)];

export const getAnswerPlaceholderForDiscover = (discover: string): string =>
	getAnswerPlaceholderForKind(getAnswerKindForDiscover(discover));

export const isValidAnswerForDiscover = (discover: string, answer: string): boolean => {
	const trimmed = answer.trim();
	if (!trimmed) return true;

	const nextKind = getAnswerKindForDiscover(discover);
	if (isFreeformAnswerKind(nextKind)) return true;

	return getAnswerBlocksForDiscover(discover).some((block) => block.text === trimmed);
};

export const isValidAnswerForDiscoverChange = (
	previousDiscover: string,
	nextDiscover: string,
	answer: string
): boolean => {
	const trimmed = answer.trim();
	if (!trimmed) return true;

	const previousKind = getAnswerKindForDiscover(previousDiscover);
	const nextKind = getAnswerKindForDiscover(nextDiscover);
	if (isFreeformAnswerKind(previousKind) && isFreeformAnswerKind(nextKind)) return true;

	return isValidAnswerForDiscover(nextDiscover, trimmed);
};
