<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Age3to5ClueBuilder from '$lib/components/clues/Age3to5ClueBuilder.svelte';
	import ClueTrailBreadcrumb from '$lib/components/clues/ClueTrailBreadcrumb.svelte';
	import { buildMixedCluePreview } from '$lib/data/clueBlocks';
	import { buildModularPuzzlePrompt, hasPuzzleSelection } from '$lib/data/puzzleModules';
	import { buildTracePrompt, isTraceReady } from '$lib/data/traceTargets';
	import type { ClueChangeDetail, FamilyClue } from '$lib/types/clues';
	import { createEmptyClue } from '$lib/types/clues';
	import {
		buildPreviewHunt,
		loadBuilderDraft,
		saveBuilderDraft,
		savePreviewHunt
	} from '$lib/utils/huntPreview';

	$: id = $page.params.id ?? 'unknown';

	let savedClues: FamilyClue[] = [];
	let draft: FamilyClue = createEmptyClue(1);
	let editingIndex: number | null = null;
	let editorKey = 0;
	let hydrated = false;

	$: isWordReady =
		draft.type === 'word' &&
		Boolean(draft.action.trim() || draft.place.trim() || draft.discover.trim() || draft.answer.trim());
	$: isPuzzleReady = draft.type === 'puzzle' && hasPuzzleSelection(draft.puzzle);
	$: isTraceReadyClue = draft.type === 'trace' && isTraceReady(draft.traceMode, draft.answer);
	$: canSave = isWordReady || isPuzzleReady || isTraceReadyClue;
	$: isWritingNew = editingIndex === null;
	$: canPreview = savedClues.length >= 1;

	$: if (hydrated) {
		saveBuilderDraft(id, { savedClues, editingIndex, draft });
	}

	onMount(() => {
		const stored = loadBuilderDraft(id);
		if (stored) {
			savedClues = stored.savedClues.map((clue) => ({
				...clue,
				puzzle: { ...clue.puzzle },
				traceMode: clue.traceMode ?? ''
			}));
			editingIndex = stored.editingIndex;
			draft = {
				...stored.draft,
				puzzle: { ...stored.draft.puzzle },
				traceMode: stored.draft.traceMode ?? ''
			};
			editorKey += 1;
		}
		hydrated = true;
	});

	const clueSummary = (clue: FamilyClue): string => {
		if (clue.type === 'puzzle') {
			return buildModularPuzzlePrompt(clue.puzzle) || 'Puzzle';
		}
		if (clue.type === 'trace') {
			return buildTracePrompt(clue.traceMode, clue.answer) || 'Trace';
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
			puzzle: { ...event.detail.puzzle },
			traceMode: event.detail.traceMode
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

	const handleEditSaved = (event: CustomEvent<number>) => {
		const index = event.detail;
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

	const handlePreview = () => {
		if (!canPreview) return;

		if (isDraftDirty() && canSave) {
			const saveFirst = window.confirm('You have an unsaved clue. Save it before previewing?');
			if (saveFirst) persistDraft();
		}

		if (savedClues.length === 0) return;

		const previewHunt = buildPreviewHunt(id, savedClues, 'Your hunt');
		savePreviewHunt(previewHunt);
		saveBuilderDraft(id, { savedClues, editingIndex, draft });
		goto(`/play/${previewHunt.code}/clue/1`);
	};
</script>

<section class="space-y-3">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex flex-wrap items-center gap-3">
			<h1 class="text-lg font-bold text-stone-900">Build hunt</h1>
			<span
				class="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800"
			>
				3–5
			</span>
			<ClueTrailBreadcrumb
				{savedClues}
				activeIndex={editingIndex}
				draftNumber={draft.n}
				{isWritingNew}
				summaryFor={clueSummary}
				on:edit={handleEditSaved}
			/>
		</div>
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="btn-secondary !px-3 !py-1.5 text-xs"
				disabled={!canSave}
				aria-label="Save this clue"
				on:click={handleSave}
			>
				Save
			</button>
			<button
				type="button"
				class="btn-primary !px-3 !py-1.5 text-xs"
				disabled={!canSave}
				aria-label="Save and add another clue"
				on:click={handleSaveAndAdd}
			>
				Save +
			</button>
			<button
				type="button"
				class="btn-secondary !px-3 !py-1.5 text-xs"
				disabled={!canPreview}
				title={canPreview
					? 'Play this hunt as a child would see it'
					: 'Save at least one clue to preview'}
				aria-label="Preview hunt as a child"
				on:click={handlePreview}
			>
				Preview
			</button>
			<a href="/hunts/{id}/share" class="btn-ghost !px-2 !py-1.5 text-xs" aria-label="Share hunt">
				Share
			</a>
		</div>
	</div>

	{#key editorKey}
		<Age3to5ClueBuilder
			clueNumber={draft.n}
			type={draft.type}
			action={draft.action}
			place={draft.place}
			discover={draft.discover}
			answer={draft.answer}
			puzzle={draft.puzzle}
			traceMode={draft.traceMode}
			on:change={handleClueChange}
		/>
	{/key}
</section>
