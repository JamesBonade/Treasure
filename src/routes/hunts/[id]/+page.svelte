<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Age3to5ClueBuilder from '$lib/components/clues/Age3to5ClueBuilder.svelte';
	import ClueTrailBreadcrumb from '$lib/components/clues/ClueTrailBreadcrumb.svelte';
	import { buildMixedCluePreview } from '$lib/data/clueBlocks';
	import { buildModularPuzzlePrompt, hasPuzzleSelection } from '$lib/data/puzzleModules';
	import { buildTracePrompt, isTraceReady } from '$lib/data/traceTargets';
	import type { AgeBand, ClueChangeDetail, FamilyClue } from '$lib/types/clues';
	import { createEmptyClue } from '$lib/types/clues';
	import { getMyHunt, huntToMeta, saveHunt } from '$lib/supabase/hunts';
	import type { HuntMeta } from '$lib/types/hunts';
	import { defaultHuntMeta, ensurePlayCode } from '$lib/utils/huntPreview';

	$: id = $page.params.id ?? 'unknown';

	let meta: HuntMeta = defaultHuntMeta();
	let savedClues: FamilyClue[] = [];
	let draft: FamilyClue = createEmptyClue(1);
	let editingIndex: number | null = null;
	let editorKey = 0;
	let ready = false;
	let saving = false;
	let saveError = '';
	let persistTimer: ReturnType<typeof setTimeout> | undefined;

	const ageBands: { value: AgeBand; label: string; available: boolean }[] = [
		{ value: '3-5', label: '3–5', available: true },
		{ value: '5-8', label: '5–8', available: false },
		{ value: '8-12', label: '8–12', available: false }
	];

	const settings = [
		{ value: '', label: 'Not set' },
		{ value: 'House', label: 'House' },
		{ value: 'Garden', label: 'Garden' },
		{ value: 'Other', label: 'Other' }
	];

	const statuses: { value: HuntMeta['status']; label: string }[] = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'published', label: 'Published' }
	];

	$: isWordReady =
		draft.type === 'word' &&
		Boolean(draft.action.trim() || draft.place.trim() || draft.discover.trim() || draft.answer.trim());
	$: isPuzzleReady = draft.type === 'puzzle' && hasPuzzleSelection(draft.puzzle);
	$: isTraceReadyClue = draft.type === 'trace' && isTraceReady(draft.traceMode, draft.answer);
	$: canSave = isWordReady || isPuzzleReady || isTraceReadyClue;
	$: isWritingNew = editingIndex === null;
	$: canPreview = savedClues.length >= 1;
	$: ageLabel = ageBands.find((band) => band.value === meta.ageBand)?.label ?? meta.ageBand;

	$: if (meta.ageBand !== '3-5') {
		meta = { ...meta, ageBand: '3-5' };
	}

	onMount(() => {
		void (async () => {
			const stored = await getMyHunt(id);
			if (stored) {
				meta = huntToMeta(stored);
				savedClues = stored.clues.map((clue) => ({
					...clue,
					puzzle: { ...clue.puzzle },
					traceMode: clue.traceMode ?? ''
				}));
				if (savedClues.length > 0) {
					const last = savedClues[savedClues.length - 1];
					draft = { ...last, puzzle: { ...last.puzzle } };
					editingIndex = savedClues.length - 1;
					editorKey += 1;
				}
			}
			ready = true;
		})();

		return () => {
			if (persistTimer) clearTimeout(persistTimer);
		};
	});

	const persistHunt = async () => {
		if (!ready) return;
		meta = ensurePlayCode(meta);
		saving = true;
		saveError = '';
		try {
			const stored = await saveHunt(id, meta, savedClues);
			meta = huntToMeta(stored);
		} catch {
			saveError = 'Could not save hunt. Check your connection and try again.';
		} finally {
			saving = false;
		}
	};

	const schedulePersist = () => {
		if (!ready) return;
		if (persistTimer) clearTimeout(persistTimer);
		persistTimer = setTimeout(() => {
			void persistHunt();
		}, 500);
	};

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

	const handleSave = async () => {
		if (!canSave) return;
		const index = persistDraft();
		const saved = savedClues[index];
		draft = { ...saved, puzzle: { ...saved.puzzle } };
		editingIndex = index;
		await persistHunt();
	};

	const handleSaveAndAdd = async () => {
		if (!canSave) return;
		persistDraft();
		editingIndex = null;
		draft = createEmptyClue(savedClues.length + 1);
		editorKey += 1;
		await persistHunt();
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

	const handlePreview = async () => {
		if (!canPreview) return;

		if (isDraftDirty() && canSave) {
			const saveFirst = window.confirm('You have an unsaved clue. Save it before previewing?');
			if (saveFirst) {
				persistDraft();
			}
		}

		if (savedClues.length === 0) return;

		await persistHunt();
		if (saveError) return;
		goto(`/play/${meta.playCode}/clue/1?preview=1`);
	};
</script>

<section class="space-y-3">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex min-w-0 flex-wrap items-center gap-3">
			<h1 class="text-lg font-bold text-stone-900">Build hunt</h1>
			<span
				class="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800"
			>
				{ageLabel}
			</span>
			{#if meta.setting}
				<span
					class="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600"
				>
					{meta.setting}
				</span>
			{/if}
			<span
				class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
				class:bg-amber-100={meta.status === 'draft'}
				class:text-amber-900={meta.status === 'draft'}
				class:bg-brand-100={meta.status === 'published'}
				class:text-brand-800={meta.status === 'published'}
			>
				{meta.status === 'published' ? 'Published' : 'Draft'}
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
			{#if saving}
				<span class="text-[10px] font-medium uppercase tracking-wide text-stone-400">Saving…</span>
			{:else if saveError}
				<span class="max-w-[10rem] text-[10px] font-medium text-red-700">{saveError}</span>
			{/if}
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

	<div class="panel grid gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:grid-cols-4">
		<label class="block min-w-0">
			<span class="field-label">Title</span>
			<input
				bind:value={meta.title}
				type="text"
				class="field-input !py-2"
				placeholder="Hunt title"
				aria-label="Hunt title"
				disabled={!ready}
				on:input={schedulePersist}
			/>
		</label>
		<label class="block min-w-0">
			<span class="field-label">Age</span>
			<select
				class="field-input !py-2"
				bind:value={meta.ageBand}
				aria-label="Age band"
				on:change={schedulePersist}
			>
				{#each ageBands as band}
					<option value={band.value} disabled={!band.available}>
						{band.available ? band.label : `${band.label} — not yet available`}
					</option>
				{/each}
			</select>
		</label>
		<label class="block min-w-0">
			<span class="field-label">Setting</span>
			<select
				class="field-input !py-2"
				bind:value={meta.setting}
				aria-label="Hunt setting"
				on:change={schedulePersist}
			>
				{#each settings as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</label>
		<label class="block min-w-0">
			<span class="field-label">Status</span>
			<select
				class="field-input !py-2"
				bind:value={meta.status}
				aria-label="Hunt status"
				on:change={schedulePersist}
			>
				{#each statuses as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</label>
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
