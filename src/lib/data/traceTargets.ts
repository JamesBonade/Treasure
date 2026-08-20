import type { ClueBlock } from '$lib/data/clueBlocks';
import type { TraceMode } from '$lib/types/clues';

const toBlocks = (texts: string[]): ClueBlock[] =>
	texts.map((text, index) => ({ n: index + 1, text }));

export const traceLetterBlocks: ClueBlock[] = toBlocks('abcdefghijklmnopqrstuvwxyz'.split(''));

/** Short, age-friendly words for tracing (lowercase). */
export const traceWordBlocks: ClueBlock[] = toBlocks([
	'cat',
	'dog',
	'sun',
	'hat',
	'mum',
	'dad',
	'big',
	'red',
	'run',
	'fun',
	'yes',
	'no',
	'up',
	'go',
	'me',
	'we',
	'bug',
	'bee',
	'map',
	'top'
]);

export const normaliseTraceText = (value: string): string =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z]/g, '')
		.slice(0, 10);

export const buildTracePrompt = (mode: TraceMode | '', text: string): string => {
	const cleaned = normaliseTraceText(text);
	if (!cleaned) return '';
	if (mode === 'word' || cleaned.length > 1) {
		return `Trace the word ${cleaned}`;
	}
	return `Trace the letter ${cleaned}`;
};

export const isTraceReady = (mode: TraceMode | '', text: string): boolean => {
	const cleaned = normaliseTraceText(text);
	if (!cleaned) return false;
	if (mode === 'word') return cleaned.length >= 2;
	return cleaned.length === 1;
};
