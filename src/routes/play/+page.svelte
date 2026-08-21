<script lang="ts">
	import { goto } from '$app/navigation';

	let code = '';

	const handleJoin = () => {
		const trimmed = code.trim().toUpperCase();
		if (!trimmed) return;
		goto(`/play/${encodeURIComponent(trimmed)}`);
	};
</script>

<section class="mx-auto max-w-md space-y-6">
	<div class="space-y-2 text-center">
		<h1 class="text-3xl font-bold text-stone-900">Join a hunt</h1>
		<p class="text-stone-600">Enter the play code from your parent or hunt organiser.</p>
	</div>

	<form class="panel space-y-4 p-5 sm:p-6" on:submit|preventDefault={handleJoin}>
		<label class="block">
			<span class="field-label">Play code</span>
			<input
				bind:value={code}
				type="text"
				class="field-input font-mono uppercase tracking-wider"
				placeholder="e.g. K7MP"
				aria-label="Play code"
				autocomplete="off"
				spellcheck="false"
			/>
		</label>
		<button type="submit" class="btn-primary w-full" disabled={!code.trim()}>Start</button>
	</form>

	<p class="text-center text-sm text-stone-500">
		Making a hunt?
		<a href="/hunts" class="font-medium text-brand-700 underline-offset-2 hover:underline">Go to My hunts</a>
	</p>
</section>
