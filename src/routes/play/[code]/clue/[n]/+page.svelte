<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import PlayClueScreen from '$lib/components/play/PlayClueScreen.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: hunt = data.hunt;
	$: preview = data.preview;
	$: n = Number($page.params.n) || 1;
	$: clue = hunt?.clues.find((item) => item.n === n);
	$: editPath = hunt ? `/hunts/${hunt.id}` : '/hunts';

	let playerName = '';

	onMount(() => {
		if (!hunt) return;
		playerName = sessionStorage.getItem(`treasure-player-${hunt.code}`) ?? '';
	});
</script>

{#if !hunt}
	<section class="mx-auto max-w-md space-y-4 text-center">
		<h1 class="text-2xl font-bold text-stone-900">Hunt not found</h1>
		<p class="text-stone-600">
			{#if preview}
				Save a couple of clues, then tap Preview again.
			{:else}
				We could not find a hunt for this code.
			{/if}
		</p>
		<a href={preview ? editPath : '/'} class="btn-primary inline-flex">
			{preview ? 'Back to builder' : 'Back home'}
		</a>
	</section>
{:else if !clue}
	<section class="mx-auto max-w-md space-y-4 text-center">
		<h1 class="text-2xl font-bold text-stone-900">Clue not found</h1>
		<a href={preview ? editPath : `/play/${hunt.code}`} class="btn-primary inline-flex">
			{preview ? 'Back to builder' : 'Back to hunt'}
		</a>
	</section>
{:else}
	{#key `${hunt.code}-${clue.n}-${clue.type}`}
		<PlayClueScreen
			{hunt}
			{clue}
			{playerName}
			backHref={preview ? editPath : '/hunts'}
			backLabel={preview ? '← Edit' : '← Hunts'}
			{preview}
		/>
	{/key}
{/if}
