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
		options: PuzzleFacetOption[];
	};

	const facets: FacetConfig[] = [
		{ key: 'number', label: 'No.', options: numberOptionsAge3to5 },
		{ key: 'object', label: 'Object', options: objectOptionsAge3to5 },
		{ key: 'colour', label: 'Colour', options: colourOptionsAge3to5 },
		{ key: 'shape', label: 'Shape', options: shapeOptionsAge3to5 }
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

	const chipClass =
		'rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-brand-100';
</script>

<div class="divide-y divide-stone-100" aria-label="Puzzle options for clue {clueNumber}">
	{#each facets as facet (facet.key)}
		{@const selected = selectedByFacet[facet.key]}
		<div class="space-y-2 py-3">
			<div class="flex items-start gap-2 sm:items-center">
				<span class="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
					{facet.label}
				</span>
				<div class="flex min-w-0 flex-1 flex-wrap gap-1.5" role="listbox" aria-label="{facet.label}">
					{#each facet.options as option (option.id)}
						<button
							type="button"
							role="option"
							aria-selected={selected?.id === option.id}
							class={chipClass}
							class:border-brand-600={selected?.id === option.id}
							class:bg-brand-600={selected?.id === option.id}
							class:text-white={selected?.id === option.id}
							class:border-stone-200={selected?.id !== option.id}
							class:bg-white={selected?.id !== option.id}
							class:text-stone-700={selected?.id !== option.id}
							class:hover:border-brand-300={selected?.id !== option.id}
							on:click={() => handlePickValue(facet.key, option.id)}
						>
							{option.label}
						</button>
					{/each}
				</div>
			</div>
			{#if selected}
				<p class="ml-[4.5rem] truncate rounded-lg bg-brand-50 px-2.5 py-1.5 text-sm font-medium text-brand-900" aria-live="polite">
					{selected.label}
				</p>
			{/if}
		</div>
	{/each}
</div>
