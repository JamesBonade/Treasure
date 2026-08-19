<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import PlayClueScreen from '$lib/components/play/PlayClueScreen.svelte';
	import { getHuntByCode } from '$lib/data/sampleHunts';

	$: code = $page.params.code ?? '';
	$: n = Number($page.params.n) || 1;
	$: hunt = getHuntByCode(code);
	$: clue = hunt?.clues.find((item) => item.n === n);

	let playerName = '';

	onMount(() => {
		playerName = sessionStorage.getItem(`treasure-player-${code}`) ?? '';
	});
</script>

{#if !hunt}
	<section class="mx-auto max-w-md space-y-4 text-center">
		<h1 class="text-2xl font-bold text-stone-900">Hunt not found</h1>
		<a href="/" class="btn-primary inline-flex">Back home</a>
	</section>
{:else if !clue}
	<section class="mx-auto max-w-md space-y-4 text-center">
		<h1 class="text-2xl font-bold text-stone-900">Clue not found</h1>
		<a href="/play/{hunt.code}" class="btn-primary inline-flex">Back to hunt</a>
	</section>
{:else}
	<PlayClueScreen {hunt} {clue} {playerName} />
{/if}
