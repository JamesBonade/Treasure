<script lang="ts">
	import PuzzleComboVisual from '$lib/components/clues/PuzzleComboVisual.svelte';
	import type { PuzzleChoiceCard } from '$lib/types/puzzleImages';

	export let cards: PuzzleChoiceCard[];
	export let clueNumber: number;

	let selectedId: string | null = null;

	$: cardsKey = cards.map((card) => card.id).join('|');
	$: if (cardsKey) {
		selectedId = null;
	}

	const handleSelectCard = (card: PuzzleChoiceCard) => {
		selectedId = card.id;
	};

	const handleCardKeyDown = (event: KeyboardEvent, card: PuzzleChoiceCard) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleSelectCard(card);
		}
	};
</script>

{#if cards.length > 0}
	<div class="space-y-2">
		<p class="text-xs font-medium uppercase tracking-wide text-stone-500">Choices</p>
		<ul
			class="grid grid-cols-2 gap-2 sm:grid-cols-4"
			aria-label="Puzzle image choices for clue {clueNumber}"
		>
			{#each cards as card}
				<li>
					<button
						type="button"
						class="w-full overflow-hidden rounded-lg border bg-white text-left"
						class:border-stone-200={selectedId !== card.id}
						class:border-sky-600={selectedId === card.id && !card.isCorrect}
						class:ring-2={selectedId === card.id}
						class:ring-sky-600={selectedId === card.id && !card.isCorrect}
						class:border-emerald-600={selectedId === card.id && card.isCorrect}
						class:ring-emerald-600={selectedId === card.id && card.isCorrect}
						aria-label="Choice for clue {clueNumber}"
						aria-pressed={selectedId === card.id}
						on:click={() => handleSelectCard(card)}
						on:keydown={(event) => handleCardKeyDown(event, card)}
					>
						<PuzzleComboVisual modules={card.modules} label="Puzzle choice" />
						{#if selectedId === card.id && card.isCorrect}
							<span class="block px-1.5 py-1 text-center text-xs font-medium text-emerald-700">
								Correct
							</span>
						{:else if selectedId === card.id}
							<span class="block px-1.5 py-1 text-center text-xs text-stone-500">Not this one</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}
