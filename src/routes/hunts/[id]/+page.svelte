<script lang="ts">
	import { page } from '$app/stores';
	import Age3to5ClueBuilder from '$lib/components/clues/Age3to5ClueBuilder.svelte';
	import { buildMixedCluePreview } from '$lib/data/clueBlocks';
	import { buildModularPuzzlePrompt, hasPuzzleSelection } from '$lib/data/puzzleModules';
	import type { ClueChangeDetail, FamilyClue } from '$lib/types/clues';
	import { createEmptyClue } from '$lib/types/clues';

	$: id = $page.params.id ?? 'unknown';

	let savedClues: FamilyClue[] = [];
	let draft: FamilyClue = createEmptyClue(1);
	let editingIndex: number | null = null;
	let editorKey = 0;

	$: isWordReady =
		draft.type === 'word' &&
		Boolean(draft.action.trim() || draft.place.trim() || draft.discover.trim() || draft.answer.trim());
	$: isPuzzleReady = draft.type === 'puzzle' && hasPuzzleSelection(draft.puzzle);
	$: canSave = isWordReady || isPuzzleReady;
	$: isEditing = editingIndex !== null;

	const clueSummary = (clue: FamilyClue): string => {
		if (clue.type === 'puzzle') {
			return buildModularPuzzlePrompt(clue.puzzle) || 'Puzzle clue';
		}
		return buildMixedCluePreview(clue.action, clue.place, clue.discover) || 'Word clue';
	};

	const isDraftDirty = (): boolean => {
		if (editingIndex === null) return canSave;
		const saved = savedClues[editingIndex];
		if (!saved) return canSave;
		return JSON.stringify({ ...draft, n: saved.n }) !== JSON.stringify(saved);
	};

	const handleClueChange = (event: CustomEvent<ClueChangeDetail>) => {
		draft = {
			...draft,
			type: event.detail.type,
			action: event.detail.action,
			place: event.detail.place,
			discover: event.detail.discover,
			answer: event.detail.answer,
			puzzle: { ...event.detail.puzzle }
		};
	};

	const persistDraft = (): number => {
		if (editingIndex !== null) {
			savedClues[editingIndex] = {
				...draft,
				n: editingIndex + 1,
				puzzle: { ...draft.puzzle }
			};
			savedClues = savedClues;
			return editingIndex;
		}

		const nextIndex = savedClues.length;
		savedClues = [
			...savedClues,
			{ ...draft, n: nextIndex + 1, puzzle: { ...draft.puzzle } }
		];
		return nextIndex;
	};

	const handleSave = () => {
		if (!canSave) return;
		const index = persistDraft();
		const saved = savedClues[index];
		draft = { ...saved, puzzle: { ...saved.puzzle } };
		editingIndex = index;
	};

	const handleSaveAndAdd = () => {
		if (!canSave) return;
		persistDraft();
		editingIndex = null;
		draft = createEmptyClue(savedClues.length + 1);
		editorKey += 1;
	};

	const handleEditSaved = (index: number) => {
		if (editingIndex === index) return;
		if (isDraftDirty()) {
			const confirmed = window.confirm(
				'Edit this saved clue? The clue you are writing now will not be saved.'
			);
			if (!confirmed) return;
		}

		const clue = savedClues[index];
		draft = { ...clue, puzzle: { ...clue.puzzle } };
		editingIndex = index;
		editorKey += 1;
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

	{#if savedClues.length > 0}
		<div class="space-y-2">
			<h2 class="text-xs font-medium uppercase tracking-wide text-stone-500">Saved clues</h2>
			<ul class="space-y-1">
				{#each savedClues as clue, index (clue.n)}
					<li
						class="flex items-start justify-between gap-3 rounded border px-3 py-2"
						class:border-emerald-700={editingIndex === index}
						class:bg-emerald-50={editingIndex === index}
						class:border-stone-200={editingIndex !== index}
						class:bg-white={editingIndex !== index}
					>
						<div class="min-w-0 text-sm">
							<p>
								<span class="font-medium text-emerald-900">Clue {clue.n}</span>
								<span class="text-stone-500"> · {clue.type === 'word' ? 'Word' : 'Puzzle'}</span>
							</p>
							<p class="mt-0.5 truncate text-stone-700">{clueSummary(clue)}</p>
						</div>
						{#if editingIndex === index}
							<span class="shrink-0 pt-0.5 text-xs font-medium text-emerald-800">Editing</span>
						{:else}
							<button
								type="button"
								class="shrink-0 text-sm text-sky-800 hover:underline"
								aria-label="Edit clue {clue.n} and abandon the current clue"
								on:click={() => handleEditSaved(index)}
							>
								Edit
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#key editorKey}
		<Age3to5ClueBuilder
			clueNumber={draft.n}
			{isEditing}
			type={draft.type}
			action={draft.action}
			place={draft.place}
			discover={draft.discover}
			answer={draft.answer}
			puzzle={draft.puzzle}
			on:change={handleClueChange}
		/>
	{/key}

	<div class="flex flex-wrap gap-2">
		<button
			type="button"
			class="rounded border border-emerald-700 px-4 py-2 text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400 disabled:hover:bg-transparent"
			aria-label="Save this clue"
			disabled={!canSave}
			on:click={handleSave}
		>
			Save
		</button>
		<button
			type="button"
			class="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:hover:bg-stone-300"
			aria-label="Save this clue and add another"
			disabled={!canSave}
			on:click={handleSaveAndAdd}
		>
			Save and add clue
		</button>
	</div>
</section>
