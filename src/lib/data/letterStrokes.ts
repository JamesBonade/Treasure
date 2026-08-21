/** Handwriting-style stroke paths for lowercase letters (viewBox 0 0 100 140). */

export type LetterStroke = {
	d: string;
};

export const LETTER_VIEW_W = 100;
export const LETTER_VIEW_H = 140;

/** Faint ruling lines shared by the stroke guide. */
export const LETTER_ASCENDER = 20;
export const LETTER_MIDLINE = 48;
export const LETTER_BASELINE = 95;
/** Lowest point for descender tails (below the baseline). */
export const LETTER_DESCENDER = 136;

/**
 * Height bands:
 * - Tall letters (b d f h k l t): ascender → baseline
 * - Short letters (a c e i m n o r s u v w x z): midline → baseline
 * - Tail letters (g j p q y): body in midline→baseline, tails to descender
 */
export const letterStrokeMap: Record<string, LetterStroke[]> = {
	a: [
		{ d: 'M 72 70 C 72 50 40 50 40 70 C 40 90 72 90 72 70' },
		{ d: 'M 72 50 L 72 95' }
	],
	b: [
		{ d: 'M 32 20 L 32 95' },
		{ d: 'M 32 62 C 32 48 68 48 68 70 C 68 92 32 95 32 78' }
	],
	c: [{ d: 'M 74 54 C 68 44 40 44 36 70 C 34 92 62 95 74 84' }],
	d: [
		{ d: 'M 70 70 C 70 50 34 50 34 70 C 34 90 70 90 70 70' },
		{ d: 'M 70 70 L 70 20' },
		{ d: 'M 70 20 L 70 95' }
	],
	e: [
		{ d: 'M 34 68 L 72 68 C 74 48 42 44 36 62 C 30 88 58 95 74 84' }
	],
	f: [
		{ d: 'M 56 30 C 54 18 38 18 36 28 L 36 95' },
		{ d: 'M 24 52 L 58 52' }
	],
	g: [
		{ d: 'M 70 68 C 70 48 40 48 36 68 C 34 86 62 90 70 74 L 70 68' },
		{ d: 'M 70 74 L 70 112 C 70 136 36 138 28 122' }
	],
	h: [
		{ d: 'M 32 20 L 32 95' },
		{ d: 'M 32 62 C 32 48 68 48 68 70 L 68 95' }
	],
	i: [
		{ d: 'M 50 48 L 50 95' },
		{ d: 'M 50 28 L 50 32' }
	],
	j: [
		{ d: 'M 58 48 L 58 112 C 58 136 28 136 26 122' },
		{ d: 'M 58 28 L 58 32' }
	],
	k: [
		{ d: 'M 34 20 L 34 95' },
		{ d: 'M 68 48 L 34 72' },
		{ d: 'M 48 64 L 72 95' }
	],
	l: [{ d: 'M 50 20 L 50 95' }],
	m: [
		{ d: 'M 22 48 L 22 95' },
		{ d: 'M 22 62 C 22 48 42 48 42 68 L 42 95' },
		{ d: 'M 42 62 C 42 48 68 48 68 68 L 68 95' }
	],
	n: [
		{ d: 'M 32 48 L 32 95' },
		{ d: 'M 32 62 C 32 48 68 48 68 70 L 68 95' }
	],
	o: [{ d: 'M 50 48 C 28 48 26 95 50 95 C 74 95 72 48 50 48' }],
	p: [
		{ d: 'M 32 48 L 32 136' },
		{ d: 'M 32 62 C 32 48 68 48 68 70 C 68 92 32 95 32 78' }
	],
	q: [
		{ d: 'M 70 70 C 70 50 38 50 38 70 C 38 90 70 90 70 70' },
		{ d: 'M 70 50 L 70 128 C 74 138 90 136 92 124' }
	],
	r: [
		{ d: 'M 36 48 L 36 95' },
		{ d: 'M 36 62 C 40 50 62 48 66 58' }
	],
	s: [{ d: 'M 68 54 C 68 44 40 44 36 54 C 34 64 66 66 66 80 C 66 94 36 95 32 84' }],
	t: [
		{ d: 'M 50 20 L 50 88 C 50 95 64 95 68 88' },
		{ d: 'M 34 48 L 66 48' }
	],
	u: [
		{ d: 'M 32 48 L 32 78 C 32 95 68 95 68 78 L 68 48' },
		{ d: 'M 68 48 L 68 95' }
	],
	v: [{ d: 'M 28 48 L 50 95 L 72 48' }],
	w: [{ d: 'M 18 48 L 32 95 L 50 58 L 68 95 L 82 48' }],
	x: [
		{ d: 'M 32 48 L 68 95' },
		{ d: 'M 68 48 L 32 95' }
	],
	y: [
		{ d: 'M 32 48 L 32 78 C 32 95 68 95 68 78 L 68 48' },
		{ d: 'M 68 48 L 68 124 C 64 136 40 138 32 124' }
	],
	z: [
		{ d: 'M 32 48 L 68 48 L 32 95 L 70 95' }
	]
};

export const getLetterStrokes = (letter: string): LetterStroke[] =>
	letterStrokeMap[letter.toLowerCase()] ?? [];

export const hasLetterStrokes = (letter: string): boolean =>
	getLetterStrokes(letter).length > 0;
