<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ModularPuzzleBuilder from '$lib/components/clues/ModularPuzzleBuilder.svelte';
	import PhraseBlockPicker from '$lib/components/clues/PhraseBlockPicker.svelte';
	import PuzzleChoiceGrid from '$lib/components/clues/PuzzleChoiceGrid.svelte';
	import TraceClueBuilder from '$lib/components/clues/TraceClueBuilder.svelte';
	import {
		actionBlocks,
		buildMixedCluePreview,
		discoverBlocks,
		placeBlocks
	} from '$lib/data/clueBlocks';
	import {
		getAnswerBlocksForDiscover,
		getAnswerKindForDiscover,
		getAnswerPlaceholderForDiscover,
		isFreeformAnswerKind,
		isValidAnswerForDiscoverChange
	} from '$lib/data/answerBlocks';
	import {
		buildModularPuzzleChoices,
		buildModularPuzzlePrompt,
		hasPuzzleSelection
	} from '$lib/data/puzzleModules';
	import { buildTracePrompt } from '$lib/data/traceTargets';
	import type { ClueChangeDetail, ClueType, PuzzleModules, TraceMode } from '$lib/types/clues';
	import { emptyPuzzleModules } from '$lib/types/clues';

	export let clueNumber: number;
	export let type: ClueType = 'word';
	export let action = '';
	export let place = '';
	export let discover = '';
	export let answer = '';
	export let puzzle: PuzzleModules = emptyPuzzleModules();
	export let traceMode: TraceMode | '' = '';

	const dispatch = createEventDispatcher<{ change: ClueChangeDetail }>();

	const actionExample = actionBlocks[0].text;
	const placeExample = placeBlocks[0].text;
	const discoverExample = discoverBlocks[0].text;

	$: activeDiscover = discover.trim() || discoverExample;
	$: answerKind = getAnswerKindForDiscover(activeDiscover);
	$: filteredAnswerBlocks = getAnswerBlocksForDiscover(activeDiscover);
	$: answerFreeform = isFreeformAnswerKind(answerKind);
	$: answerExample = answerFreeform
		? getAnswerPlaceholderForDiscover(activeDiscover)
		: (filteredAnswerBlocks[0]?.text ?? '');

	$: puzzlePrompt = buildModularPuzzlePrompt(puzzle);
	$: choiceCards = type === 'puzzle' ? buildModularPuzzleChoices(puzzle) : [];
	$: tracePrompt = buildTracePrompt(traceMode, answer);
	$: previewAction = action.trim() || actionExample;
	$: previewPlace = place.trim() || placeExample;
	$: previewDiscover = discover.trim() || discoverExample;
	$: previewAnswer = answer.trim() || answerExample;
	$: wordPreview = buildMixedCluePreview(previewAction, previewPlace, previewDiscover);
	$: preview =
		type === 'word' ? wordPreview : type === 'trace' ? tracePrompt : puzzlePrompt;
	$: previewIsExample =
		type === 'word' && !action.trim() && !place.trim() && !discover.trim() && !answer.trim();
	$: answerIsExample = !answer.trim();

	const emitChange = (next: Partial<ClueChangeDetail>) => {
		dispatch('change', {
			type: next.type !== undefined ? next.type : type,
			action: next.action !== undefined ? next.action : action,
			place: next.place !== undefined ? next.place : place,
			discover: next.discover !== undefined ? next.discover : discover,
			answer: next.answer !== undefined ? next.answer : answer,
			puzzle: next.puzzle !== undefined ? next.puzzle : puzzle,
			traceMode: next.traceMode !== undefined ? next.traceMode : traceMode
		});
	};

	const handleTypeChange = (nextType: ClueType) => {
		if (nextType === type) return;
		emitChange({
			type: nextType,
			action: '',
			place: '',
			discover: '',
			answer: '',
			puzzle: emptyPuzzleModules(),
			traceMode: nextType === 'trace' ? 'letter' : ''
		});
	};

	const handleActionChange = (event: CustomEvent<string>) => {
		emitChange({ action: event.detail });
	};

	const handlePlaceChange = (event: CustomEvent<string>) => {
		emitChange({ place: event.detail });
	};

	const handleDiscoverChange = (event: CustomEvent<string>) => {
		const nextDiscover = event.detail;
		const nextAnswer = isValidAnswerForDiscoverChange(activeDiscover, nextDiscover, answer)
			? answer
			: '';
		emitChange({ discover: nextDiscover, answer: nextAnswer });
	};

	const handleAnswerChange = (event: CustomEvent<string>) => {
		emitChange({ answer: event.detail });
	};

	const handlePuzzleChange = (event: CustomEvent<PuzzleModules>) => {
		emitChange({ puzzle: event.detail });
	};

	const handleTraceChange = (event: CustomEvent<{ mode: TraceMode; text: string }>) => {
		emitChange({
			traceMode: event.detail.mode,
			answer: event.detail.text
		});
	};
</script>

<article class="panel overflow-hidden" aria-labelledby="clue-{clueNumber}-heading">
	<div class="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
		<div class="flex items-center gap-3">
			<h2 id="clue-{clueNumber}-heading" class="text-sm font-semibold text-stone-900">
				Clue {clueNumber}
			</h2>
			<div class="segmented !p-0.5 text-xs" role="group" aria-label="Clue type">
				<button
					type="button"
					class="segmented-btn !px-2.5 !py-1"
					class:segmented-btn-active={type === 'word'}
					aria-pressed={type === 'word'}
					on:click={() => handleTypeChange('word')}
				>
					Word
				</button>
				<button
					type="button"
					class="segmented-btn !px-2.5 !py-1"
					class:segmented-btn-active={type === 'puzzle'}
					aria-pressed={type === 'puzzle'}
					on:click={() => handleTypeChange('puzzle')}
				>
					Puzzle
				</button>
				<button
					type="button"
					class="segmented-btn !px-2.5 !py-1"
					class:segmented-btn-active={type === 'trace'}
					aria-pressed={type === 'trace'}
					on:click={() => handleTypeChange('trace')}
				>
					Trace
				</button>
			</div>
		</div>

		<p
			class="min-w-0 max-w-md truncate text-xs text-stone-500 sm:text-right"
			class:italic={previewIsExample}
			aria-live="polite"
		>
			{#if type === 'word'}
				{wordPreview}{#if !answerIsExample || !previewIsExample} → {previewAnswer}{/if}
			{:else}
				{preview}
			{/if}
		</p>
	</div>

	<div class="px-4 py-2">
		{#if type === 'word'}
			<PhraseBlockPicker
				id="action-{clueNumber}"
				label="Action"
				example={actionExample}
				value={action}
				blocks={actionBlocks}
				layout="compact"
				on:change={handleActionChange}
			/>
			<PhraseBlockPicker
				id="place-{clueNumber}"
				label="Place"
				example={placeExample}
				value={place}
				blocks={placeBlocks}
				layout="phrase"
				on:change={handlePlaceChange}
			/>
			<PhraseBlockPicker
				id="discover-{clueNumber}"
				label="Ask"
				example={discoverExample}
				value={discover}
				blocks={discoverBlocks}
				layout="phrase"
				on:change={handleDiscoverChange}
			/>
			{#key activeDiscover}
				<PhraseBlockPicker
					id="answer-{clueNumber}"
					label="Answer"
					example={answerExample}
					value={answer}
					blocks={filteredAnswerBlocks}
					freeform={answerFreeform}
					layout={answerFreeform ? 'phrase' : 'compact'}
					on:change={handleAnswerChange}
				/>
			{/key}
		{:else if type === 'trace'}
			<TraceClueBuilder
				{clueNumber}
				mode={traceMode || 'letter'}
				text={answer}
				on:change={handleTraceChange}
			/>
		{:else}
			<ModularPuzzleBuilder {clueNumber} {puzzle} on:change={handlePuzzleChange} />
			{#if hasPuzzleSelection(puzzle)}
				<div class="border-t border-stone-100 pt-3">
					<PuzzleChoiceGrid cards={choiceCards} {clueNumber} />
				</div>
			{/if}
		{/if}
	</div>
</article>
