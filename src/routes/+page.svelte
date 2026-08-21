<script lang="ts">
	import { goto } from '$app/navigation';
	import { startNewHunt } from '$lib/utils/huntPreview';

	const handleCreateHunt = () => {
		const id = startNewHunt();
		goto(`/hunts/${id}`);
	};
</script>

<section class="space-y-10">
	<div class="panel overflow-hidden">
		<div class="bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 px-6 py-10 text-white sm:px-8 sm:py-12">
			<p class="text-sm font-medium text-brand-100">Family treasure hunts</p>
			<h1 class="mt-2 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
				Create clues kids love to follow
			</h1>
			<p class="mt-4 max-w-2xl text-base text-brand-50/90 sm:text-lg">
				Build age-appropriate hunts at home or in the garden. Hide the prize, set the clues, and
				let children follow the trail.
			</p>
			<div class="mt-6 flex flex-wrap gap-3">
				<button
					type="button"
					class="btn-primary !bg-white !text-brand-800 hover:!bg-brand-50"
					aria-label="Create a home hunt"
					on:click={handleCreateHunt}
				>
					Create a home hunt
				</button>
				<a href="/hunts" class="btn-secondary !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
					My hunts
				</a>
			</div>
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-3">
		<div class="panel p-5">
			<p class="text-sm font-semibold text-stone-900">Build clues</p>
			<p class="mt-2 text-sm text-stone-600">
				Combine actions, places, and questions into clear word clues kids can follow.
			</p>
		</div>
		<div class="panel p-5">
			<p class="text-sm font-semibold text-stone-900">Mix puzzle types</p>
			<p class="mt-2 text-sm text-stone-600">
				Add visual puzzle clues with numbers, colours, shapes, and objects.
			</p>
		</div>
		<div class="panel p-5">
			<p class="text-sm font-semibold text-stone-900">Share and play</p>
			<p class="mt-2 text-sm text-stone-600">
				Share a play code and let children solve each step until they find the treasure.
			</p>
		</div>
	</div>
</section>
