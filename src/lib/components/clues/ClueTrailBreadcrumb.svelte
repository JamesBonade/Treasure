<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FamilyClue } from '$lib/types/clues';

	export let savedClues: FamilyClue[] = [];
	export let activeIndex: number | null = null;
	export let draftNumber = 1;
	export let isWritingNew = true;
	export let summaryFor: (clue: FamilyClue) => string;

	const dispatch = createEventDispatcher<{ edit: number }>();

	const handleEdit = (index: number) => {
		if (activeIndex === index) return;
		dispatch('edit', index);
	};
</script>

<nav aria-label="Clue trail">
	<ol class="flex items-center gap-1 overflow-x-auto">
		{#each savedClues as clue, index (clue.n)}
			<li class="flex shrink-0 items-center gap-1">
				{#if index > 0}
					<span class="text-stone-300" aria-hidden="true">›</span>
				{/if}
				<button
					type="button"
					class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition"
					class:bg-brand-700={activeIndex === index}
					class:text-white={activeIndex === index}
					class:ring-2={activeIndex === index}
					class:ring-brand-200={activeIndex === index}
					class:bg-stone-100={activeIndex !== index}
					class:text-stone-600={activeIndex !== index}
					class:hover:bg-stone-200={activeIndex !== index}
					aria-current={activeIndex === index ? 'step' : undefined}
					title={summaryFor(clue)}
					aria-label="Clue {clue.n}: {summaryFor(clue)}"
					on:click={() => handleEdit(index)}
				>
					{clue.n}
				</button>
			</li>
		{/each}

		{#if isWritingNew}
			{#if savedClues.length > 0}
				<li class="flex shrink-0 items-center" aria-hidden="true">
					<span class="px-1 text-stone-300">›</span>
				</li>
			{/if}
			<li class="flex shrink-0 items-center">
				<span
					class="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-brand-500 bg-brand-50 text-xs font-bold text-brand-700"
					aria-current="step"
					title="Writing clue {draftNumber}"
				>
					{draftNumber}
				</span>
			</li>
		{/if}
	</ol>
</nav>
