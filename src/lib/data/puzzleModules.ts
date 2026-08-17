import type { PuzzleFacet, PuzzleModules } from '$lib/types/clues';
import type { PuzzleChoiceCard, PuzzleFacetOption } from '$lib/types/puzzleImages';

export const numberOptionsAge3to5: PuzzleFacetOption[] = [
	{ id: '1', label: '1', word: '1', src: '/puzzle/number-1.svg' },
	{ id: '2', label: '2', word: '2', src: '/puzzle/number-2.svg' },
	{ id: '3', label: '3', word: '3', src: '/puzzle/number-3.svg' },
	{ id: '4', label: '4', word: '4', src: '/puzzle/number-4.svg' }
];

export const objectOptionsAge3to5: PuzzleFacetOption[] = [
	{ id: 'dog', label: 'Dog', word: 'dog', plural: 'dogs', src: '/puzzle/dog.svg' },
	{ id: 'cat', label: 'Cat', word: 'cat', plural: 'cats', src: '/puzzle/cat.svg' },
	{ id: 'bird', label: 'Bird', word: 'bird', plural: 'birds', src: '/puzzle/bird.svg' },
	{ id: 'fish', label: 'Fish', word: 'fish', plural: 'fish', src: '/puzzle/fish.svg' }
];

export const colourOptionsAge3to5: PuzzleFacetOption[] = [
	{ id: 'blue', label: 'Blue', word: 'blue', src: '/puzzle/colour-blue.svg' },
	{ id: 'red', label: 'Red', word: 'red', src: '/puzzle/colour-red.svg' },
	{ id: 'yellow', label: 'Yellow', word: 'yellow', src: '/puzzle/colour-yellow.svg' },
	{ id: 'green', label: 'Green', word: 'green', src: '/puzzle/colour-green.svg' }
];

export const shapeOptionsAge3to5: PuzzleFacetOption[] = [
	{ id: 'circle', label: 'Circle', word: 'circle', plural: 'circles', src: '/puzzle/shape-circle.svg' },
	{ id: 'square', label: 'Square', word: 'square', plural: 'squares', src: '/puzzle/shape-square.svg' },
	{ id: 'triangle', label: 'Triangle', word: 'triangle', plural: 'triangles', src: '/puzzle/shape-triangle.svg' },
	{ id: 'star', label: 'Star', word: 'star', plural: 'stars', src: '/puzzle/shape-star.svg' }
];

export const colourHex: Record<string, string> = {
	blue: '#2563EB',
	red: '#DC2626',
	yellow: '#EAB308',
	green: '#16A34A'
};

export const getActiveFacets = (puzzle: PuzzleModules): PuzzleFacet[] => {
	const facets: PuzzleFacet[] = [];
	if (puzzle.number) facets.push('number');
	if (puzzle.object) facets.push('object');
	if (puzzle.colour) facets.push('colour');
	if (puzzle.shape) facets.push('shape');
	return facets;
};

const findOption = (
	options: PuzzleFacetOption[],
	id: string | null
): PuzzleFacetOption | null => {
	if (!id) return null;
	return options.find((option) => option.id === id) ?? null;
};

const nounFor = (option: PuzzleFacetOption, count: number | null): string => {
	if (count !== null && count > 1) {
		return option.plural ?? `${option.word}s`;
	}
	return option.word;
};

/** Compose “Select the …” from any active facet combination. */
export const buildModularPuzzlePrompt = (puzzle: PuzzleModules): string => {
	const count = puzzle.number ? Number(puzzle.number) : null;
	const safeCount = count !== null && !Number.isNaN(count) ? count : null;
	const colour = findOption(colourOptionsAge3to5, puzzle.colour);
	const shape = findOption(shapeOptionsAge3to5, puzzle.shape);
	const object = findOption(objectOptionsAge3to5, puzzle.object);

	const parts: string[] = [];

	if (safeCount !== null) {
		parts.push(String(safeCount));
	}
	if (colour) {
		parts.push(colour.word);
	}
	if (shape && object) {
		parts.push(shape.word);
		parts.push(nounFor(object, safeCount));
	} else if (object) {
		parts.push(nounFor(object, safeCount));
	} else if (shape) {
		parts.push(nounFor(shape, safeCount));
	}

	if (parts.length === 0) return '';
	return `Select the ${parts.join(' ')}`;
};

export const hasPuzzleSelection = (puzzle: PuzzleModules): boolean =>
	getActiveFacets(puzzle).length > 0;

const optionsForFacet = (facet: PuzzleFacet): PuzzleFacetOption[] => {
	if (facet === 'number') return numberOptionsAge3to5;
	if (facet === 'object') return objectOptionsAge3to5;
	if (facet === 'colour') return colourOptionsAge3to5;
	return shapeOptionsAge3to5;
};

/**
 * Child choices stay inside the selected facet set.
 * Each card is a full combination; decoys change one active facet at a time.
 * Order is shuffled (seeded by the puzzle) so the answer is not first.
 */
export const buildModularPuzzleChoices = (puzzle: PuzzleModules): PuzzleChoiceCard[] => {
	const activeFacets = getActiveFacets(puzzle);
	if (activeFacets.length === 0) return [];

	const toCard = (id: string, variant: PuzzleModules, isCorrect: boolean): PuzzleChoiceCard => ({
		id,
		label: buildModularPuzzlePrompt(variant).replace(/^Select the /, ''),
		isCorrect,
		modules: { ...variant }
	});

	const cards: PuzzleChoiceCard[] = [toCard(`combo-${JSON.stringify(puzzle)}`, puzzle, true)];
	const seen = new Set<string>([JSON.stringify(puzzle)]);

	let safety = 0;
	while (cards.length < 4 && safety < 24) {
		safety += 1;
		const facet = activeFacets[(cards.length - 1) % activeFacets.length];
		const options = optionsForFacet(facet);
		const alt = options.find((option) => {
			if (option.id === puzzle[facet]) return false;
			const variant = { ...puzzle, [facet]: option.id };
			return !seen.has(JSON.stringify(variant));
		});
		if (!alt) continue;
		const variant = { ...puzzle, [facet]: alt.id };
		seen.add(JSON.stringify(variant));
		cards.push(toCard(`${facet}-${alt.id}`, variant, false));
	}

	return shuffleWithSeed(cards, hashString(JSON.stringify(puzzle)));
};

const hashString = (value: string): number => {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}
	return Math.abs(hash) || 1;
};

const shuffleWithSeed = <T>(items: T[], seed: number): T[] => {
	const copy = [...items];
	let state = seed;
	for (let index = copy.length - 1; index > 0; index -= 1) {
		state = (state * 16807) % 2147483647;
		const swapIndex = state % (index + 1);
		const current = copy[index];
		copy[index] = copy[swapIndex];
		copy[swapIndex] = current;
	}
	return copy;
};

export const getObjectSrc = (objectId: string | null): string | null =>
	findOption(objectOptionsAge3to5, objectId)?.src ?? null;

export const getShapeSrc = (shapeId: string | null): string | null =>
	findOption(shapeOptionsAge3to5, shapeId)?.src ?? null;

const objectSilhouettes: Record<string, string> = {
	dog: '/puzzle/silhouette-dog.svg',
	cat: '/puzzle/silhouette-cat.svg',
	bird: '/puzzle/silhouette-bird.svg',
	fish: '/puzzle/silhouette-fish.svg'
};

const shapeSilhouettes: Record<string, string> = {
	circle: '/puzzle/silhouette-circle.svg',
	square: '/puzzle/silhouette-square.svg',
	triangle: '/puzzle/silhouette-triangle.svg',
	star: '/puzzle/silhouette-star.svg'
};

/** Artwork for coloured masking — transparent silhouettes only. */
export const getObjectMaskSrc = (objectId: string | null): string | null =>
	objectId ? objectSilhouettes[objectId] ?? null : null;

export const getShapeMaskSrc = (shapeId: string | null): string | null =>
	shapeId ? shapeSilhouettes[shapeId] ?? null : null;
