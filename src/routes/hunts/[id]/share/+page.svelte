<script lang="ts">
	import { page } from '$app/stores';

	$: id = $page.params.id ?? 'unknown';
	const playCode = 'DEMO';
</script>

<section class="space-y-8">
	<div class="space-y-2">
		<p class="text-sm text-stone-500">{id}</p>
		<h1 class="text-3xl font-bold text-emerald-900">Share hunt</h1>
		<p class="text-stone-600">Birthday Garden Quest · Ages 3–5 · Garden</p>
	</div>

	<div class="space-y-3">
		<h2 class="text-lg font-semibold">Play code</h2>
		<p class="font-mono text-2xl tracking-widest text-emerald-800">{playCode}</p>
		<p class="text-sm text-stone-500">Children join at /play/{playCode}</p>
		<a
			href="/play/{playCode}"
			class="inline-block text-emerald-700 underline"
			aria-label="Open play join page for code {playCode}"
		>
			Open join page
		</a>
	</div>

	<div class="flex flex-wrap gap-3">
		<a
			href="/hunts/{id}"
			class="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
			aria-label="Edit clues for this hunt"
		>
			Edit clues
		</a>
		<a href="/hunts" class="px-4 py-2 text-stone-600 underline" aria-label="Back to my hunts">
			My hunts
		</a>
	</div>
</section>
