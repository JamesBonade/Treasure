<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import PlayPuzzleAnswer from '$lib/components/play/PlayPuzzleAnswer.svelte';
	import PlayTraceAnswer from '$lib/components/play/PlayTraceAnswer.svelte';
	import PlayWordAnswer from '$lib/components/play/PlayWordAnswer.svelte';
	import { getClueDisplay, getCluePrompt, type PlayHunt } from '$lib/data/sampleHunts';
	import type { FamilyClue } from '$lib/types/clues';
	import { canSpeak, speakText, stopSpeaking } from '$lib/utils/speech';

	export let hunt: PlayHunt;
	export let clue: FamilyClue;
	export let playerName = '';
	export let backHref = '/hunts';
	export let backLabel = '← Hunts';
	export let preview = false;

	let isSpeaking = false;

	$: prompt = getCluePrompt(clue);
	$: display = getClueDisplay(clue);
	$: totalClues = hunt.clues.length;
	$: previewQuery = preview ? '?preview=1' : '';
	$: nextPath =
		clue.n >= totalClues
			? `/play/${hunt.code}/complete${previewQuery}`
			: `/play/${hunt.code}/clue/${clue.n + 1}${previewQuery}`;

	onMount(() => {
		if (prompt) {
			isSpeaking = true;
			speakText(prompt);
			window.setTimeout(() => {
				isSpeaking = false;
			}, Math.min(prompt.length * 55, 8000));
		}
	});

	onDestroy(() => {
		stopSpeaking();
	});

	const handleListenAgain = () => {
		if (!prompt) return;
		isSpeaking = true;
		speakText(prompt);
		window.setTimeout(() => {
			isSpeaking = false;
		}, Math.min(prompt.length * 55, 8000));
	};

	const handleSolved = () => {
		goto(nextPath);
	};
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-5 sm:gap-6">
	<header class="flex items-center justify-between gap-3 pt-1">
		<a
			href={backHref}
			class="rounded-lg px-2 py-1 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
			aria-label={preview ? 'Back to builder' : 'Back to hunts'}
		>
			{backLabel}
		</a>
		<div class="min-w-0 text-center">
			{#if preview}
				<p class="text-[10px] font-semibold uppercase tracking-wider text-brand-600">Preview</p>
			{/if}
			<p class="truncate text-sm font-medium text-stone-600">{hunt.title}</p>
		</div>
		<span class="shrink-0 text-xs font-semibold text-brand-700">{clue.n}/{totalClues}</span>
	</header>

	<div class="flex justify-center gap-1.5" aria-hidden="true">
		{#each hunt.clues as trailClue (trailClue.n)}
			<span
				class="h-1.5 rounded-full transition-all duration-300"
				class:w-6={trailClue.n === clue.n}
				class:w-1.5={trailClue.n !== clue.n}
				class:bg-brand-600={trailClue.n === clue.n}
				class:bg-brand-200={trailClue.n > clue.n}
				class:bg-brand-400={trailClue.n < clue.n}
			></span>
		{/each}
	</div>

	<section
		class="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-white via-brand-50/40 to-white px-6 py-8 shadow-soft"
		aria-labelledby="clue-heading"
	>
		<div class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-100/60 blur-2xl"></div>

		<div class="relative mx-auto max-w-sm space-y-5 text-center">
			<div class="space-y-1">
				<p id="clue-heading" class="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">
					Your clue
				</p>
				{#if playerName}
					<p class="text-sm text-stone-500">Go {playerName}!</p>
				{/if}
			</div>

			<div class="space-y-2">
				{#if display.type === 'word'}
					{#if display.lead}
						<p class="text-lg font-medium leading-snug text-stone-600">{display.lead}</p>
					{/if}
					{#if display.question}
						<p class="text-2xl font-bold leading-tight text-stone-900">{display.question}</p>
					{/if}
				{:else}
					<p class="text-2xl font-bold leading-snug text-stone-900 sm:text-3xl">{display.target}</p>
				{/if}
			</div>

			<p class="sr-only">{prompt}</p>

			{#if canSpeak()}
				<button
					type="button"
					class="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-200"
					class:animate-pulse={isSpeaking}
					aria-label="Listen to the clue again"
					on:click={handleListenAgain}
				>
					<span class="text-base" aria-hidden="true">{isSpeaking ? '🔊' : '🔈'}</span>
					{isSpeaking ? 'Reading…' : 'Listen again'}
				</button>
			{/if}
		</div>
	</section>

	<section class="flex flex-col rounded-3xl border border-stone-200/80 bg-white p-5 shadow-soft sm:p-6">
		<h2 class="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
			{#if clue.type === 'word'}
				What is your answer?
			{:else if clue.type === 'trace'}
				Trace with your finger
			{:else}
				Tap the right picture
			{/if}
		</h2>

		{#if clue.type === 'word'}
			<PlayWordAnswer {clue} on:solved={handleSolved} />
		{:else if clue.type === 'trace'}
			<PlayTraceAnswer {clue} on:solved={handleSolved} />
		{:else}
			<PlayPuzzleAnswer {clue} on:solved={handleSolved} />
		{/if}
	</section>
</div>
