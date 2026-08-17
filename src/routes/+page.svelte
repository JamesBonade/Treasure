<script lang="ts">
	const handleCreateHomeHunt = () => {
		// Shell only — navigation via href
	};

	const handleViewHunts = () => {
		// Shell only — navigation via href
	};
</script>

<section class="space-y-10">
	<div class="space-y-4">
		<h1 class="text-4xl font-bold tracking-tight text-emerald-900 sm:text-5xl">Treasure</h1>
		<p class="max-w-2xl text-lg text-stone-600">
			Create age-appropriate treasure hunts at home or in the garden. Hide the prize, set the clues,
			and let the kids follow the trail.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href="/hunts/new"
				class="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
				aria-label="Create a home hunt"
				on:click={handleCreateHomeHunt}
			>
				Create a home hunt
			</a>
			<a
				href="/hunts"
				class="rounded border border-emerald-700 px-4 py-2 text-emerald-800 hover:bg-emerald-50"
				aria-label="View my hunts"
				on:click={handleViewHunts}
			>
				My hunts
			</a>
		</div>
	</div>

	<div class="max-w-2xl space-y-2">
		<h2 class="text-xl font-semibold">Family hunts</h2>
		<p class="text-stone-600">
			Parents build a sequence of written clues, puzzles, or maps. Children join with a play code and
			solve each step until they find the treasure you have already hidden.
		</p>
		<a href="/how-it-works" class="text-emerald-700 underline" aria-label="Learn how family hunts work">
			How it works
		</a>
	</div>
</section>
