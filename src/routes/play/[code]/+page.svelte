<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PlayHunt } from '$lib/data/sampleHunts';
	import {
		huntIdFromPreviewCode,
		isPreviewCode,
		resolvePlayHunt
	} from '$lib/utils/huntPreview';

	$: code = $page.params.code ?? '';
	$: isDraft = isPreviewCode(code);
	$: editPath = huntIdFromPreviewCode(code) ? `/hunts/${huntIdFromPreviewCode(code)}` : '/hunts';

	let hunt: PlayHunt | undefined;
	let ready = false;
	let playerName = '';

	onMount(() => {
		hunt = resolvePlayHunt(code);
		ready = true;
	});

	const handleStart = () => {
		if (playerName.trim()) {
			sessionStorage.setItem(`treasure-player-${code}`, playerName.trim());
		}
	};
</script>

{#if !ready}
	<section class="mx-auto max-w-md py-16 text-center text-sm text-stone-500">Loading…</section>
{:else if !hunt}
	<section class="mx-auto max-w-md space-y-4 text-center">
		<h1 class="text-2xl font-bold text-stone-900">Hunt not found</h1>
		<p class="text-stone-600">
			{#if isDraft}
				Save a couple of clues, then tap Preview again.
			{:else}
				We could not find a hunt for code "{code}".
			{/if}
		</p>
		<a href={isDraft ? editPath : '/'} class="btn-primary inline-flex">
			{isDraft ? 'Back to builder' : 'Back home'}
		</a>
	</section>
{:else if isDraft}
	<section class="mx-auto max-w-lg space-y-6 text-center">
		<div class="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-soft">
			<div class="bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10 text-white sm:px-8">
				<p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-100">Child preview</p>
				<h1 class="mt-3 text-3xl font-bold">{hunt.title}</h1>
				<p class="mt-3 text-sm text-brand-50">{hunt.clues.length} clues · as kids will see them</p>
			</div>
			<div class="space-y-3 p-6 sm:p-8">
				<a
					href="/play/{hunt.code}/clue/1"
					class="btn-primary block w-full py-3 text-center text-base"
					aria-label="Start preview of {hunt.title}"
				>
					Start preview
				</a>
				<a href={editPath} class="btn-ghost block w-full text-center text-sm">Back to builder</a>
			</div>
		</div>
	</section>
{:else}
	<section class="mx-auto max-w-lg space-y-6">
		<div class="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-soft">
			<div class="bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10 text-center text-white sm:px-8">
				<p class="text-xs font-bold uppercase tracking-[0.2em] text-brand-100">Join hunt</p>
				<h1 class="mt-3 text-3xl font-bold sm:text-4xl">{hunt.title}</h1>
				<p class="mt-3 text-sm text-brand-50">
					{hunt.setting} · {hunt.clues.length} clues · ages {hunt.ageBand}
				</p>
				<p class="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 font-mono text-sm tracking-wider">
					{hunt.code}
				</p>
			</div>

			<div class="space-y-5 p-6 sm:p-8">
				<label class="block space-y-2">
					<span class="field-label">Explorer name (optional)</span>
					<input
						bind:value={playerName}
						type="text"
						class="field-input text-base"
						placeholder="The Explorers"
						aria-label="Your name or team name"
					/>
				</label>

				<a
					href="/play/{hunt.code}/clue/1"
					class="btn-primary block w-full py-3 text-center text-base"
					aria-label="Start {hunt.title}"
					on:click={handleStart}
				>
					Let's go!
				</a>
			</div>
		</div>
	</section>
{/if}
