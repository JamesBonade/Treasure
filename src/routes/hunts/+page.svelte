<script lang="ts">
	import { sampleHunts } from '$lib/data/sampleHunts';

	const hunts = sampleHunts
		.filter((hunt) => hunt.id !== 'demo')
		.map((hunt) => ({
			id: hunt.id,
			title: hunt.title,
			setting: hunt.setting,
			clueCount: hunt.clues.length,
			playCode: hunt.code
		}));
</script>

<section class="space-y-6">
	<div class="panel flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
		<div class="space-y-1">
			<h1 class="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">My hunts</h1>
			<p class="text-sm text-stone-600">Ready-made hunts you can play straight away or customise.</p>
		</div>
		<a href="/hunts/new" class="btn-primary" aria-label="Create a new hunt">New hunt</a>
	</div>

	<ul class="grid gap-4 sm:grid-cols-2">
		{#each hunts as hunt}
			<li class="panel p-5 transition hover:shadow-md">
				<div class="flex items-start justify-between gap-3">
					<div>
						<h2 class="text-lg font-semibold text-stone-900">{hunt.title}</h2>
						<p class="mt-1 text-sm text-stone-600">{hunt.setting} · {hunt.clueCount} clues</p>
						<p class="mt-1 font-mono text-xs text-stone-500">Code {hunt.playCode}</p>
					</div>
					<span class="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800">
						Ready
					</span>
				</div>
				<div class="mt-4 flex flex-wrap gap-2">
					<a href="/play/{hunt.playCode}/clue/1" class="btn-primary !px-3 !py-2 text-xs">Play</a>
					<a href="/hunts/{hunt.id}" class="btn-secondary !px-3 !py-2 text-xs">Build</a>
					<a href="/hunts/{hunt.id}/share" class="btn-ghost !px-3 !py-2 text-xs">Share</a>
				</div>
			</li>
		{/each}
	</ul>
</section>
