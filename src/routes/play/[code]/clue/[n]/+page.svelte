<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import PlayClueScreen from '$lib/components/play/PlayClueScreen.svelte';
	import type { PlayHunt } from '$lib/data/sampleHunts';
	import {
		huntIdFromPreviewCode,
		isPreviewCode,
		resolvePlayHunt
	} from '$lib/utils/huntPreview';

	$: code = $page.params.code ?? '';
	$: n = Number($page.params.n) || 1;
	$: isDraft = isPreviewCode(code);
	$: editPath = huntIdFromPreviewCode(code) ? `/hunts/${huntIdFromPreviewCode(code)}` : '/hunts';

	let hunt: PlayHunt | undefined;
	let ready = false;
	let playerName = '';

	$: clue = hunt?.clues.find((item) => item.n === n);

	onMount(() => {
		hunt = resolvePlayHunt(code);
		playerName = sessionStorage.getItem(`treasure-player-${code}`) ?? '';
		ready = true;
	});

	$: if (ready) {
		hunt = resolvePlayHunt(code);
	}
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
				We could not find a hunt for this code.
			{/if}
		</p>
		<a href={isDraft ? editPath : '/'} class="btn-primary inline-flex">
			{isDraft ? 'Back to builder' : 'Back home'}
		</a>
	</section>
{:else if !clue}
	<section class="mx-auto max-w-md space-y-4 text-center">
		<h1 class="text-2xl font-bold text-stone-900">Clue not found</h1>
		<a href={isDraft ? editPath : `/play/${hunt.code}`} class="btn-primary inline-flex">
			{isDraft ? 'Back to builder' : 'Back to hunt'}
		</a>
	</section>
{:else}
	{#key `${hunt.code}-${clue.n}-${clue.type}`}
		<PlayClueScreen
			{hunt}
			{clue}
			{playerName}
			backHref={isDraft ? editPath : '/hunts'}
			backLabel={isDraft ? '← Edit' : '← Hunts'}
			preview={isDraft}
		/>
	{/key}
{/if}
