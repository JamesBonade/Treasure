<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		colourOptionsAge3to5,
		numberOptionsAge3to5,
		objectOptionsAge3to5,
		shapeOptionsAge3to5
	} from '$lib/data/puzzleModules';
	import type { PuzzleFacet, PuzzleModules } from '$lib/types/clues';
	import type { PuzzleFacetOption } from '$lib/types/puzzleImages';

	export let clueNumber: number;
	export let puzzle: PuzzleModules;

	const dispatch = createEventDispatcher<{ change: PuzzleModules }>();

	type FacetConfig = {
		key: PuzzleFacet;
		label: string;
		placeholder: string;
		options: PuzzleFacetOption[];
	};

	const facets: FacetConfig[] = [
		{
			key: 'number',
			label: 'Number',
			placeholder: 'Choose a number…',
			options: numberOptionsAge3to5
		},
		{
			key: 'object',
			label: 'Object',
			placeholder: 'Choose an object…',
			options: objectOptionsAge3to5
		},
		{
			key: 'colour',
			label: 'Colour',
			placeholder: 'Choose a colour…',
			options: colourOptionsAge3to5
		},
		{
			key: 'shape',
			label: 'Shape',
			placeholder: 'Choose a shape…',
			options: shapeOptionsAge3to5
		}
	];

	let draft: PuzzleModules = {
		number: puzzle.number,
		object: puzzle.object,
		colour: puzzle.colour,
		shape: puzzle.shape
	};
	let syncedFrom: PuzzleModules = puzzle;

	$: if (puzzle !== syncedFrom) {
		syncedFrom = puzzle;
		draft = {
			number: puzzle.number,
			object: puzzle.object,
			colour: puzzle.colour,
			shape: puzzle.shape
		};
	}

	const findOption = (
		options: PuzzleFacetOption[],
		id: string | null
	): PuzzleFacetOption | null => {
		if (!id) return null;
		return options.find((option) => option.id === id) ?? null;
	};

	$: selectedByFacet = {
		number: findOption(numberOptionsAge3to5, draft.number),
		object: findOption(objectOptionsAge3to5, draft.object),
		colour: findOption(colourOptionsAge3to5, draft.colour),
		shape: findOption(shapeOptionsAge3to5, draft.shape)
	} as Record<PuzzleFacet, PuzzleFacetOption | null>;

	const emitDraft = (next: PuzzleModules) => {
		draft = next;
		dispatch('change', { ...next });
	};

	const handlePickValue = (key: PuzzleFacet, id: string) => {
		const isSame = draft[key] === id;
		emitDraft({ ...draft, [key]: isSame ? null : id });
	};
</script>

<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Puzzle options for clue {clueNumber}">
	{#each facets as facet (facet.key)}
		{@const selected = selectedByFacet[facet.key]}
		<div class="min-w-0">
			<p class="mb-1 text-xs font-medium uppercase tracking-wide text-stone-500">
				{facet.label}
			</p>
			<div
				class="w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-sm"
				class:text-stone-400={!selected}
				class:italic={!selected}
				class:text-stone-900={!!selected}
				aria-live="polite"
			>
				{selected?.label ?? facet.placeholder}
			</div>
			<div
				class="mt-1.5 flex flex-wrap gap-1.5"
				role="listbox"
				aria-label="{facet.label} options"
			>
				{#each facet.options as option (option.id)}
					<button
						type="button"
						role="option"
						aria-selected={selected?.id === option.id}
						class="max-w-full rounded-full border px-2.5 py-0.5 text-xs"
						class:border-emerald-700={selected?.id === option.id}
						class:bg-emerald-50={selected?.id === option.id}
						class:text-emerald-900={selected?.id === option.id}
						class:border-stone-300={selected?.id !== option.id}
						class:bg-white={selected?.id !== option.id}
						class:text-stone-700={selected?.id !== option.id}
						class:hover:border-stone-400={selected?.id !== option.id}
						title={option.label}
						on:click={() => handlePickValue(facet.key, option.id)}
					>
						<span class="block truncate">{option.label}</span>
					</button>
				{/each}
			</div>
		</div>
	{/each}
</div>
