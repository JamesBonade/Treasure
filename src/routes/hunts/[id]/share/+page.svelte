<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getMyHunt, huntToMeta } from '$lib/supabase/hunts';
	import type { HuntMeta } from '$lib/types/hunts';
	import { defaultHuntMeta } from '$lib/utils/huntPreview';

	$: id = $page.params.id ?? 'unknown';

	let meta: HuntMeta = defaultHuntMeta();
	let clueCount = 0;
	let ready = false;
	let playable = false;

	$: playCode = meta.playCode || '————';

	onMount(() => {
		void (async () => {
			const hunt = await getMyHunt(id);
			if (hunt) {
				meta = huntToMeta(hunt);
				clueCount = hunt.clues.length;
				playable = clueCount > 0;
			}
			ready = true;
		})();
	});
</script>

<section class="space-y-6">
	<div class="panel p-5 sm:p-6">
		<p class="text-sm text-stone-500">{id}</p>
		<h1 class="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">Share hunt</h1>
		{#if ready}
			<p class="mt-2 text-stone-600">
				{meta.title.trim() || 'Untitled hunt'} · Ages {meta.ageBand}
				{#if meta.setting}
					· {meta.setting}
				{/if}
				· {clueCount}
				{clueCount === 1 ? 'clue' : 'clues'}
			</p>
		{/if}
	</div>

	<div class="panel space-y-4 p-5 sm:p-6">
		<div>
			<h2 class="text-sm font-semibold text-stone-900">Play code</h2>
			<p class="mt-2 font-mono text-4xl tracking-[0.35em] text-brand-800">{playCode}</p>
			<p class="mt-2 text-sm text-stone-500">Children enter this code on the Play page.</p>
		</div>
		{#if playable}
			<a
				href="/play/{playCode}"
				class="btn-primary inline-flex"
				aria-label="Open play page for code {playCode}"
			>
				Try the play screen
			</a>
		{:else}
			<p class="text-sm text-stone-500">Save at least one clue before sharing play.</p>
		{/if}
	</div>

	<div class="flex flex-wrap gap-2">
		<a href="/hunts/{id}" class="btn-secondary" aria-label="Edit clues for this hunt">Edit clues</a>
		<a href="/hunts" class="btn-ghost" aria-label="Back to my hunts">My hunts</a>
	</div>
</section>
