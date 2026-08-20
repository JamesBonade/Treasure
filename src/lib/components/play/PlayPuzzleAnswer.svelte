<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import PuzzleChoiceGrid from '$lib/components/clues/PuzzleChoiceGrid.svelte';
	import { buildModularPuzzleChoices } from '$lib/data/puzzleModules';
	import type { FamilyClue } from '$lib/types/clues';
	import { speakText } from '$lib/utils/speech';

	export let clue: FamilyClue;

	const dispatch = createEventDispatcher<{ solved: void }>();

	let feedback = '';
	let selectedCorrect = false;
	let solveTimer: ReturnType<typeof setTimeout> | undefined;

	$: cards = buildModularPuzzleChoices(clue.puzzle);

	const handleSelect = (event: CustomEvent<{ cardId: string; isCorrect: boolean }>) => {
		if (selectedCorrect) return;
		if (event.detail.isCorrect) {
			selectedCorrect = true;
			feedback = 'Correct! Well done!';
			speakText('Correct! Well done!');
			window.clearTimeout(solveTimer);
			solveTimer = window.setTimeout(() => dispatch('solved'), 700);
			return;
		}
		feedback = 'Not this one — try again!';
		speakText('Not this one. Try again.');
	};

	onDestroy(() => {
		window.clearTimeout(solveTimer);
	});
</script>

<div class="mx-auto flex w-full max-w-sm flex-1 flex-col gap-4">
	<PuzzleChoiceGrid {cards} clueNumber={clue.n} playMode on:select={handleSelect} />

	{#if feedback}
		<p
			class="rounded-2xl px-4 py-3 text-center text-sm font-semibold"
			class:bg-brand-50={selectedCorrect}
			class:text-brand-900={selectedCorrect}
			class:bg-red-50={!selectedCorrect}
			class:text-red-800={!selectedCorrect}
			aria-live="polite"
		>
			{feedback}
		</p>
	{/if}
</div>
