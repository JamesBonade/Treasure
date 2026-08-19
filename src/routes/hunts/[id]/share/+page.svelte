<script lang="ts">
	import { page } from '$app/stores';
	import { getHuntById } from '$lib/data/sampleHunts';

	$: id = $page.params.id ?? 'unknown';
	$: hunt = getHuntById(id);
	$: playCode = hunt?.code ?? 'DEMO';
</script>

<section class="space-y-6">
	<div class="panel p-5 sm:p-6">
		<p class="text-sm text-stone-500">{id}</p>
		<h1 class="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">Share hunt</h1>
		{#if hunt}
			<p class="mt-2 text-stone-600">
				{hunt.title} · Ages {hunt.ageBand} · {hunt.setting}
			</p>
		{/if}
	</div>

	<div class="panel space-y-4 p-5 sm:p-6">
		<div>
			<h2 class="text-sm font-semibold text-stone-900">Play code</h2>
			<p class="mt-2 font-mono text-3xl tracking-widest text-brand-800">{playCode}</p>
			<p class="mt-2 text-sm text-stone-500">Children join at /play/{playCode}</p>
		</div>
		<a href="/play/{playCode}" class="btn-primary inline-flex" aria-label="Open play page for code {playCode}">
			Try the play screen
		</a>
	</div>

	<div class="flex flex-wrap gap-2">
		<a href="/hunts/{id}" class="btn-secondary" aria-label="Edit clues for this hunt">Edit clues</a>
		<a href="/hunts" class="btn-ghost" aria-label="Back to my hunts">My hunts</a>
	</div>
</section>
