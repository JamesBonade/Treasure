<script lang="ts">
	import { page } from '$app/stores';
	import Age3to5ClueBuilder from '$lib/components/clues/Age3to5ClueBuilder.svelte';
	import type { ClueChangeDetail, FamilyClue } from '$lib/types/clues';
	import { emptyPuzzleModules } from '$lib/types/clues';

	$: id = $page.params.id ?? 'unknown';

	let clues: FamilyClue[] = [
		{
			n: 1,
			type: 'word',
			action: '',
			place: '',
			discover: '',
			answer: '',
			puzzle: emptyPuzzleModules()
		},
		{
			n: 2,
			type: 'word',
			action: '',
			place: '',
			discover: '',
			answer: '',
			puzzle: emptyPuzzleModules()
		},
		{
			n: 3,
			type: 'puzzle',
			action: '',
			place: '',
			discover: '',
			answer: '',
			puzzle: { number: null, object: null, colour: null, shape: 'circle' }
		}
	];

	const handleClueChange = (index: number, event: CustomEvent<ClueChangeDetail>) => {
		clues[index] = {
			...clues[index],
			type: event.detail.type,
			action: event.detail.action,
			place: event.detail.place,
			discover: event.detail.discover,
			answer: event.detail.answer,
			puzzle: { ...event.detail.puzzle }
		};
		clues = clues;
	};

	const handleAddClue = () => {
		clues = [
			...clues,
			{
				n: clues.length + 1,
				type: 'word',
				action: '',
				place: '',
				discover: '',
				answer: '',
				puzzle: emptyPuzzleModules()
			}
		];
	};
</script>

<section class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<div>
			<p class="text-sm text-stone-500">{id} · 3–5</p>
			<h1 class="text-2xl font-bold text-emerald-900">Build hunt</h1>
		</div>
		<a
			href="/hunts/{id}/share"
			class="text-sm text-emerald-700 underline"
			aria-label="Share this hunt"
		>
			Share
		</a>
	</div>

	<div>
		{#each clues as clue, index (clue.n)}
			<Age3to5ClueBuilder
				clueNumber={clue.n}
				type={clue.type}
				action={clue.action}
				place={clue.place}
				discover={clue.discover}
				answer={clue.answer}
				puzzle={clue.puzzle}
				on:change={(event) => handleClueChange(index, event)}
			/>
		{/each}
	</div>

	<button
		type="button"
		class="rounded border border-emerald-700 px-4 py-2 text-emerald-800 hover:bg-emerald-50"
		aria-label="Add another clue"
		on:click={handleAddClue}
	>
		Add clue
	</button>
</section>
