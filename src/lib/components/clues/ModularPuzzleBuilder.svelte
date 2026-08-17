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
		{ key: 'number', label: 'Number', options: numberOptionsAge3to5 },
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

	let choosingFacet: PuzzleFacet | null = null;

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

	const handleChoose = (key: PuzzleFacet) => {
		choosingFacet = choosingFacet === key ? null : key;
	};

	const handlePickValue = (key: PuzzleFacet, id: string) => {
		choosingFacet = null;
		draft = { ...draft, [key]: id };
		dispatch('change', { ...draft });
	};

	const handleClear = (key: PuzzleFacet) => {
		choosingFacet = null;
		draft = { ...draft, [key]: null };
		dispatch('change', { ...draft });
	};
</script>

<div class="rounded-lg border border-stone-200 bg-white">
	{#each facets as facet, index (facet.key)}
		<div class="border-stone-200" class:border-t={index > 0}>
			<div class="flex min-h-[3rem] items-center gap-3 px-3 py-2">
				<span class="w-16 shrink-0 text-sm font-medium text-stone-700">{facet.label}</span>

				<div class="flex min-w-0 flex-1 items-center gap-2" aria-live="polite">
					{#if selectedByFacet[facet.key]}
						<img
							src={selectedByFacet[facet.key]?.src}
							alt=""
							class="h-6 w-6 rounded border border-stone-300 object-cover"
						/>
						<span class="truncate text-sm text-stone-600"
							>{selectedByFacet[facet.key]?.label}</span
						>
					{/if}
				</div>

				{#if selectedByFacet[facet.key]}
					<button
						type="button"
						class="shrink-0 rounded px-2.5 py-1 text-sm text-stone-600 hover:bg-stone-100"
						aria-label="Clear {facet.label} selection"
						on:click={() => handleClear(facet.key)}
					>
						Clear
					</button>
				{:else}
					<button
						type="button"
						class="shrink-0 rounded px-2.5 py-1 text-sm text-sky-800 hover:bg-sky-50"
						aria-expanded={choosingFacet === facet.key}
						aria-controls="facet-panel-{clueNumber}-{facet.key}"
						aria-label="Choose {facet.label}"
						on:click={() => handleChoose(facet.key)}
					>
						Choose
					</button>
				{/if}
			</div>

			{#if choosingFacet === facet.key}
				<div
					id="facet-panel-{clueNumber}-{facet.key}"
					class="border-t border-stone-100 bg-stone-50 px-3 py-3"
				>
					<div class="flex flex-wrap gap-2">
						{#each facet.options as option (option.id)}
							<button
								type="button"
								class="overflow-hidden rounded border border-stone-200 bg-white hover:border-sky-600 focus:border-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
								aria-label={option.label}
								on:click|stopPropagation={() => handlePickValue(facet.key, option.id)}
							>
								<img
									src={option.src}
									alt=""
									class="pointer-events-none h-12 w-12 object-cover"
								/>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>
