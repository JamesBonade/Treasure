<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import PuzzleComboVisual from '$lib/components/clues/PuzzleComboVisual.svelte';
	import type { PuzzleChoiceCard } from '$lib/types/puzzleImages';

	export let cards: PuzzleChoiceCard[];
	export let clueNumber: number;
	export let playMode = false;

	const dispatch = createEventDispatcher<{
		select: { cardId: string; isCorrect: boolean };
	}>();

	let selectedId: string | null = null;

	$: cardsKey = cards.map((card) => card.id).join('|');
	$: if (cardsKey) {
		selectedId = null;
	}

	const handleSelectCard = (card: PuzzleChoiceCard) => {
		selectedId = card.id;
		dispatch('select', { cardId: card.id, isCorrect: card.isCorrect });
	};

	const handleCardKeyDown = (event: KeyboardEvent, card: PuzzleChoiceCard) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleSelectCard(card);
		}
	};
</script>

{#if cards.length > 0}
	<div class="space-y-3">
		{#if !playMode}
			<div>
				<p class="field-label">Child choices</p>
				<p class="text-xs text-stone-500">Tap a card to preview what kids will pick from.</p>
			</div>
		{/if}
		<ul
			class="grid gap-3 {playMode ? 'grid-cols-2 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}"
			aria-label="Puzzle image choices for clue {clueNumber}"
		>
			{#each cards as card}
				<li>
					<button
						type="button"
						class="w-full overflow-hidden text-left transition hover:shadow-md"
						class:panel={!playMode}
						class:rounded-3xl={playMode}
						class:border-2={playMode}
						class:border-stone-200={playMode && selectedId !== card.id}
						class:bg-white={playMode}
						class:shadow-soft={playMode}
						class:hover:border-brand-300={playMode}
						class:ring-2={selectedId === card.id}
						class:ring-sky-500={selectedId === card.id && !card.isCorrect}
						class:ring-brand-500={selectedId === card.id && card.isCorrect}
						aria-label="Choice for clue {clueNumber}"
						aria-pressed={selectedId === card.id}
						on:click={() => handleSelectCard(card)}
						on:keydown={(event) => handleCardKeyDown(event, card)}
					>
						<PuzzleComboVisual modules={card.modules} label="Puzzle choice" />
						{#if selectedId === card.id && card.isCorrect}
							<span class="block bg-brand-50 px-2 py-2 text-center text-xs font-medium text-brand-800">
								Correct
							</span>
						{:else if selectedId === card.id}
							<span class="block px-2 py-2 text-center text-xs text-stone-500">Not this one</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}
