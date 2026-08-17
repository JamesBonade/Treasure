<script lang="ts">
	import { page } from '$app/stores';

	$: code = $page.params.code ?? 'unknown';
	let teamName = '';

	const handleStart = () => {
		// Shell only
	};
</script>

<section class="mx-auto max-w-md space-y-6">
	<div class="space-y-2 text-center">
		<p class="text-sm text-stone-500">Play code: {code}</p>
		<h1 class="text-3xl font-bold text-emerald-900">Join the hunt</h1>
		<p class="text-stone-600">Enter your name or team name to begin.</p>
	</div>

	<label class="block space-y-1">
		<span class="text-sm font-medium">Name / team</span>
		<input
			bind:value={teamName}
			type="text"
			class="w-full rounded border border-stone-300 px-3 py-2"
			placeholder="The Explorers"
			aria-label="Name or team name"
		/>
	</label>

	<a
		href="/play/{code}/clue/1"
		class="block rounded bg-emerald-700 px-4 py-3 text-center text-white hover:bg-emerald-800"
		aria-label="Start the hunt"
		on:click={handleStart}
	>
		Start hunt
	</a>
</section>
