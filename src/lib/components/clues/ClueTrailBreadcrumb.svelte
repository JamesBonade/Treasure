<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FamilyClue } from '$lib/types/clues';

	export let savedClues: FamilyClue[] = [];
	export let activeIndex: number | null = null;
	export let draftNumber = 1;
	export let isWritingNew = true;
	export let summaryFor: (clue: FamilyClue) => string;

	const dispatch = createEventDispatcher<{ edit: number; delete: number }>();

	const handleEdit = (index: number) => {
		if (activeIndex === index) return;
		dispatch('edit', index);
	};

	const handleDelete = (index: number, event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		dispatch('delete', index);
	};

	const handleDeleteKeyDown = (index: number, event: KeyboardEvent) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		event.stopPropagation();
		dispatch('delete', index);
	};
</script>

<nav aria-label="Clue trail">
	<ol class="flex items-center gap-1 overflow-x-auto">
		{#each savedClues as clue, index (clue.n)}
			<li class="flex shrink-0 items-center gap-1">
				{#if index > 0}
					<span class="text-stone-300" aria-hidden="true">›</span>
				{/if}
				<div class="relative flex items-center">
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
					<button
						type="button"
						class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-stone-700 text-[9px] font-bold leading-none text-white shadow-sm transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
						aria-label="Delete clue {clue.n}"
						title="Delete clue {clue.n}"
						on:click={(event) => handleDelete(index, event)}
						on:keydown={(event) => handleDeleteKeyDown(index, event)}
					>
						×
					</button>
				</div>
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
