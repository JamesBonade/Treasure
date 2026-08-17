<script lang="ts">
	let title = '';
	let ageBand = '3-5';
	let setting = 'house';
	let clueCount = 5;

	const handleSubmit = () => {
		// Shell only — would create hunt then navigate to edit
	};
</script>

<section class="space-y-6">
	<div class="space-y-1">
		<h1 class="text-3xl font-bold text-emerald-900">New hunt</h1>
		<p class="text-stone-600">Set the basics; then build clues.</p>
	</div>

	<form class="max-w-lg space-y-4" on:submit|preventDefault={handleSubmit}>
		<label class="block space-y-1">
			<span class="text-sm font-medium">Title</span>
			<input
				bind:value={title}
				type="text"
				class="w-full rounded border border-stone-300 px-3 py-2"
				placeholder="e.g. Birthday Garden Quest"
				aria-label="Hunt title"
			/>
		</label>

		<label class="block space-y-1">
			<span class="text-sm font-medium">Age band</span>
			<select
				bind:value={ageBand}
				class="w-full rounded border border-stone-300 px-3 py-2"
				aria-label="Age band"
			>
				<option value="3-5">3–5</option>
				<option value="5-8">5–8</option>
				<option value="8-12">8–12</option>
			</select>
		</label>

		<label class="block space-y-1">
			<span class="text-sm font-medium">Setting</span>
			<select
				bind:value={setting}
				class="w-full rounded border border-stone-300 px-3 py-2"
				aria-label="Hunt setting"
			>
				<option value="house">House</option>
				<option value="garden">Garden</option>
				<option value="other">Other</option>
			</select>
		</label>

		<label class="block space-y-1">
			<span class="text-sm font-medium">Number of clues</span>
			<input
				bind:value={clueCount}
				type="number"
				min="1"
				max="20"
				class="w-full rounded border border-stone-300 px-3 py-2"
				aria-label="Number of clues"
			/>
		</label>

		<div class="flex flex-wrap gap-3 pt-2">
			<a
				href="/hunts/hunt-1"
				class="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
				aria-label="Continue to build clues"
			>
				Build clues
			</a>
			<a href="/hunts" class="px-4 py-2 text-stone-600 underline" aria-label="Cancel and return">
				Cancel
			</a>
		</div>
	</form>
</section>
