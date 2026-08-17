<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ModularPuzzleBuilder from '$lib/components/clues/ModularPuzzleBuilder.svelte';
	import PhraseBlockPicker from '$lib/components/clues/PhraseBlockPicker.svelte';
	import PuzzleChoiceGrid from '$lib/components/clues/PuzzleChoiceGrid.svelte';
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
	import type { ClueChangeDetail, ClueType, PuzzleModules } from '$lib/types/clues';
	import { emptyPuzzleModules } from '$lib/types/clues';

	export let clueNumber: number;
	export let type: ClueType = 'word';
	export let action = '';
	export let place = '';
	export let discover = '';
	export let answer = '';
	export let puzzle: PuzzleModules = emptyPuzzleModules();

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
	$: previewAction = action.trim() || actionExample;
	$: previewPlace = place.trim() || placeExample;
	$: previewDiscover = discover.trim() || discoverExample;
	$: previewAnswer = answer.trim() || answerExample;
	$: wordPreview = buildMixedCluePreview(previewAction, previewPlace, previewDiscover);
	$: preview = type === 'word' ? wordPreview : puzzlePrompt;
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
			puzzle: next.puzzle !== undefined ? next.puzzle : puzzle
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
			puzzle: emptyPuzzleModules()
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
</script>

<article class="space-y-3 border-t border-stone-200 pt-5" aria-labelledby="clue-{clueNumber}-heading">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h2 id="clue-{clueNumber}-heading" class="text-base font-semibold text-emerald-900">
			Clue {clueNumber}
		</h2>
		<div class="flex rounded border border-stone-300 text-sm" role="group" aria-label="Clue type">
			<button
				type="button"
				class="px-2.5 py-1"
				class:bg-emerald-700={type === 'word'}
				class:text-white={type === 'word'}
				aria-pressed={type === 'word'}
				on:click={() => handleTypeChange('word')}
			>
				Word
			</button>
			<button
				type="button"
				class="border-l border-stone-300 px-2.5 py-1"
				class:bg-emerald-700={type === 'puzzle'}
				class:text-white={type === 'puzzle'}
				aria-pressed={type === 'puzzle'}
				on:click={() => handleTypeChange('puzzle')}
			>
				Puzzle
			</button>
		</div>
	</div>

	{#if type === 'word'}
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<PhraseBlockPicker
				id="action-{clueNumber}"
				label="Action"
				example={actionExample}
				value={action}
				blocks={actionBlocks}
				on:change={handleActionChange}
			/>
			<PhraseBlockPicker
				id="place-{clueNumber}"
				label="Place"
				example={placeExample}
				value={place}
				blocks={placeBlocks}
				on:change={handlePlaceChange}
			/>
			<PhraseBlockPicker
				id="discover-{clueNumber}"
				label="Discover"
				example={discoverExample}
				value={discover}
				blocks={discoverBlocks}
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
					on:change={handleAnswerChange}
				/>
			{/key}
		</div>
	{:else}
		<div class="space-y-2">
			<p class="text-xs font-medium uppercase tracking-wide text-stone-500">Prompt</p>
			<ModularPuzzleBuilder {clueNumber} {puzzle} on:change={handlePuzzleChange} />
			{#if hasPuzzleSelection(puzzle)}
				<PuzzleChoiceGrid cards={choiceCards} {clueNumber} />
			{/if}
		</div>
	{/if}

	{#if preview}
		<div class="space-y-1 text-sm" aria-live="polite">
			<p
				class:text-stone-400={previewIsExample}
				class:italic={previewIsExample}
				class:text-stone-500={!previewIsExample}
			>
				{type === 'word' ? 'Kids hear' : 'Kids see'}:
				<span class:text-stone-800={!previewIsExample}>{preview}</span>
			</p>
			{#if type === 'word'}
				<p
					class:text-stone-400={answerIsExample}
					class:italic={answerIsExample}
					class:text-stone-500={!answerIsExample}
				>
					Expected answer:
					<span class:text-stone-800={!answerIsExample}>{previewAnswer}</span>
				</p>
			{/if}
		</div>
	{/if}
</article>
