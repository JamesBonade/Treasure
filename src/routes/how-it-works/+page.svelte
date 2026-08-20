<script lang="ts">
	type ClueType = {
		name: string;
		description: string;
	};

	const clueTypes: ClueType[] = [
		{ name: 'Word', description: 'Action, place, and a question kids answer.' },
		{ name: 'Puzzle', description: 'Pick the matching number, animal, colour, or shape.' },
		{ name: 'Trace', description: 'Trace a letter or short word with a finger or mouse.' }
	];
</script>

<section class="space-y-10">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold text-emerald-900">How it works</h1>
		<p class="max-w-2xl text-stone-600">
			Parents create a home or garden hunt, hide the treasure, and share a play code. Kids follow
			the clues until they find it.
		</p>
	</div>

	<div class="max-w-xl space-y-3">
		<h2 class="text-xl font-semibold">Family hunt flow</h2>
		<ol class="list-decimal space-y-2 pl-5 text-stone-700">
			<li>Create a hunt and pick an age band and setting (house, garden, other).</li>
			<li>Add an ordered list of clues leading to the final treasure spot.</li>
			<li>Hide the treasure at the last location.</li>
			<li>Share a play code with your children.</li>
			<li>They solve each clue until they find the treasure.</li>
		</ol>
		<a href="/hunts" class="inline-block text-emerald-700 underline" aria-label="Open my hunts">
			Go to my hunts
		</a>
	</div>

	<div class="space-y-4">
		<h2 class="text-xl font-semibold">Clue types (placeholder)</h2>
		<ul class="grid gap-4 sm:grid-cols-3">
			{#each clueTypes as clueType}
				<li class="space-y-1 border-t border-stone-200 pt-3">
					<h3 class="font-medium">{clueType.name}</h3>
					<p class="text-sm text-stone-600">{clueType.description}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>
