<script lang="ts">
	import { page } from '$app/stores';

	$: code = $page.params.code ?? 'unknown';
</script>

<section class="mx-auto max-w-lg space-y-6 text-center">
	<p class="text-sm text-stone-500">Play code: {code}</p>
	<h1 class="text-4xl font-bold text-emerald-900">Treasure found!</h1>
	<p class="text-lg text-stone-600">
		You followed every clue. Celebrate — the treasure is yours (placeholder).
	</p>
	<a href="/" class="inline-block text-emerald-700 underline" aria-label="Return to Treasure home">
		Back home
	</a>
</section>
