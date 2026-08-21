<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { listMyHunts, migrateLocalDrafts } from '$lib/supabase/hunts';
	import type { HuntListItem } from '$lib/types/hunts';
	import { startNewHunt } from '$lib/utils/huntPreview';

	let hunts: HuntListItem[] = [];
	let ready = false;
	let loadError = '';

	const refreshHunts = async () => {
		loadError = '';
		try {
			await migrateLocalDrafts();
			hunts = await listMyHunts();
		} catch {
			loadError = 'Could not load hunts. Check your connection and try again.';
			hunts = [];
		}
	};

	onMount(() => {
		void refreshHunts().finally(() => {
			ready = true;
		});
	});

	const handleNewHunt = () => {
		const id = startNewHunt();
		goto(`/hunts/${id}`);
	};

	const handlePlay = (hunt: HuntListItem) => {
		if (hunt.clueCount < 1) return;
		goto(`/play/${hunt.playCode}/clue/1`);
	};
</script>

<section class="space-y-6">
	<div class="panel flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
		<div class="space-y-1">
			<h1 class="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">My hunts</h1>
			<p class="text-sm text-stone-600">Build your own family hunts — nothing pre-made here.</p>
		</div>
		<button type="button" class="btn-primary" aria-label="Create a new hunt" on:click={handleNewHunt}>
			New hunt
		</button>
	</div>

	{#if !ready}
		<p class="text-center text-sm text-stone-500">Loading…</p>
	{:else if loadError}
		<div class="panel space-y-4 p-8 text-center">
			<p class="text-stone-600">{loadError}</p>
			<button type="button" class="btn-primary" on:click={() => void refreshHunts()}>Try again</button>
		</div>
	{:else if hunts.length === 0}
		<div class="panel space-y-4 p-8 text-center">
			<p class="text-stone-600">You haven’t created a hunt yet.</p>
			<button type="button" class="btn-primary" on:click={handleNewHunt}>Create your first hunt</button>
		</div>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each hunts as hunt (hunt.id)}
				<li class="panel p-5 transition hover:shadow-md">
					<div class="flex items-start justify-between gap-3">
						<div>
							<h2 class="text-lg font-semibold text-stone-900">{hunt.title}</h2>
							<p class="mt-1 text-sm text-stone-600">
								{hunt.setting} · {hunt.clueCount}
								{hunt.clueCount === 1 ? 'clue' : 'clues'} · ages {hunt.ageBand}
							</p>
							<p class="mt-1 font-mono text-sm tracking-widest text-stone-500">
								Code {hunt.playCode}
							</p>
						</div>
						<span
							class="rounded-full px-2.5 py-0.5 text-xs font-medium"
							class:bg-amber-100={hunt.status === 'draft'}
							class:text-amber-900={hunt.status === 'draft'}
							class:bg-brand-100={hunt.status === 'published'}
							class:text-brand-800={hunt.status === 'published'}
						>
							{hunt.status === 'published' ? 'Published' : 'Draft'}
						</span>
					</div>
					<div class="mt-4 flex flex-wrap gap-2">
						<button
							type="button"
							class="btn-primary !px-3 !py-2 text-xs"
							disabled={hunt.clueCount < 1}
							aria-label="Play {hunt.title}"
							on:click={() => handlePlay(hunt)}
						>
							Play
						</button>
						<a href="/hunts/{hunt.id}" class="btn-secondary !px-3 !py-2 text-xs">Build</a>
						<a href="/hunts/{hunt.id}/share" class="btn-ghost !px-3 !py-2 text-xs">Share</a>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
