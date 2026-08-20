<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import LetterStrokeGuide from '$lib/components/clues/LetterStrokeGuide.svelte';
	import {
		isTraceReady,
		normaliseTraceText,
		traceLetterBlocks,
		traceWordBlocks
	} from '$lib/data/traceTargets';
	import type { TraceMode } from '$lib/types/clues';

	export let clueNumber: number;
	export let mode: TraceMode | '' = 'letter';
	export let text = '';

	const dispatch = createEventDispatcher<{
		change: { mode: TraceMode; text: string };
	}>();

	$: activeMode = (mode === 'word' ? 'word' : 'letter') as TraceMode;
	$: cleaned = normaliseTraceText(text);
	$: blocks = activeMode === 'letter' ? traceLetterBlocks : traceWordBlocks;
	$: ready = isTraceReady(activeMode, cleaned);

	const emit = (nextMode: TraceMode, nextText: string) => {
		dispatch('change', {
			mode: nextMode,
			text: normaliseTraceText(nextText)
		});
	};

	const handleModeChange = (nextMode: TraceMode) => {
		if (nextMode === activeMode) return;
		emit(nextMode, '');
	};

	const handlePick = (value: string) => {
		emit(activeMode, value);
	};

	const handleCustomInput = (event: Event) => {
		emit(activeMode, (event.currentTarget as HTMLInputElement).value);
	};

	const chipClass =
		'rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-brand-100';
</script>

<div class="space-y-4 py-2" aria-label="Trace options for clue {clueNumber}">
	<div class="flex items-center gap-3">
		<span class="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
			Type
		</span>
		<div class="segmented !p-0.5 text-xs" role="group" aria-label="Trace letter or word">
			<button
				type="button"
				class="segmented-btn !px-2.5 !py-1"
				class:segmented-btn-active={activeMode === 'letter'}
				aria-pressed={activeMode === 'letter'}
				on:click={() => handleModeChange('letter')}
			>
				Letter
			</button>
			<button
				type="button"
				class="segmented-btn !px-2.5 !py-1"
				class:segmented-btn-active={activeMode === 'word'}
				aria-pressed={activeMode === 'word'}
				on:click={() => handleModeChange('word')}
			>
				Word
			</button>
		</div>
	</div>

	<div class="border-b border-stone-100 pb-4">
		<div class="mb-3 flex items-center justify-between gap-2">
			<span class="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
				{activeMode === 'letter' ? 'Letter to trace' : 'Word to trace'}
			</span>
			{#if cleaned}
				<span class="rounded-lg bg-brand-50 px-2.5 py-1 font-serif text-lg font-bold tracking-wide text-brand-900">
					{cleaned}
				</span>
			{/if}
		</div>

		{#if activeMode === 'letter'}
			<div class="flex flex-wrap gap-1.5" role="listbox" aria-label="Letters">
				{#each blocks as block (block.n)}
					<button
						type="button"
						role="option"
						aria-selected={cleaned === block.text}
						class="{chipClass} min-w-[2.25rem] font-serif text-base"
						class:border-brand-600={cleaned === block.text}
						class:bg-brand-600={cleaned === block.text}
						class:text-white={cleaned === block.text}
						class:border-stone-200={cleaned !== block.text}
						class:bg-white={cleaned !== block.text}
						class:text-stone-700={cleaned !== block.text}
						class:hover:border-brand-300={cleaned !== block.text}
						on:click={() => handlePick(block.text)}
					>
						{block.text}
					</button>
				{/each}
			</div>
		{:else}
			<div class="flex flex-wrap gap-1.5" role="listbox" aria-label="Words">
				{#each blocks as block (block.n)}
					<button
						type="button"
						role="option"
						aria-selected={cleaned === block.text}
						class="{chipClass} font-serif"
						class:border-brand-600={cleaned === block.text}
						class:bg-brand-600={cleaned === block.text}
						class:text-white={cleaned === block.text}
						class:border-stone-200={cleaned !== block.text}
						class:bg-white={cleaned !== block.text}
						class:text-stone-700={cleaned !== block.text}
						class:hover:border-brand-300={cleaned !== block.text}
						on:click={() => handlePick(block.text)}
					>
						{block.text}
					</button>
				{/each}
			</div>
			<label class="mt-3 block">
				<span class="field-label">Or type a short word</span>
				<input
					type="text"
					class="field-input font-serif lowercase tracking-wide"
					maxlength="10"
					placeholder="e.g. treasure"
					aria-label="Custom word to trace"
					value={cleaned}
					on:input={handleCustomInput}
				/>
			</label>
		{/if}
	</div>

	{#if ready}
		<div class="rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 px-4 py-5 text-center">
			<p class="text-xs font-semibold uppercase tracking-wider text-brand-700">How to write it</p>
			<div class="mt-4">
				{#key cleaned}
					<LetterStrokeGuide text={cleaned} compact />
				{/key}
			</div>
			<p class="mt-3 text-sm text-stone-600">Watch the animation, then kids trace it</p>
		</div>
	{:else}
		<p class="text-sm text-stone-500">
			{activeMode === 'letter' ? 'Pick a letter to continue.' : 'Pick or type a word (2–10 letters).'}
		</p>
	{/if}
</div>
