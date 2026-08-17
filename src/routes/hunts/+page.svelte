<script lang="ts">
	type ParentHunt = {
		id: string;
		title: string;
		setting: string;
		clueCount: number;
	};

	const hunts: ParentHunt[] = [
		{ id: 'hunt-1', title: 'Birthday Garden Quest', setting: 'Garden', clueCount: 5 },
		{ id: 'hunt-2', title: 'Rainy Day House Hunt', setting: 'House', clueCount: 4 }
	];
</script>

<section class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-bold text-emerald-900">My hunts</h1>
			<p class="text-stone-600">Home and garden hunts.</p>
		</div>
		<a
			href="/hunts/new"
			class="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
			aria-label="Create a new hunt"
		>
			New hunt
		</a>
	</div>

	<ul class="divide-y divide-stone-200 border-t border-stone-200">
		{#each hunts as hunt}
			<li class="flex flex-wrap items-baseline justify-between gap-2 py-4">
				<div>
					<a
						href="/hunts/{hunt.id}"
						class="font-semibold text-emerald-800 hover:underline"
						aria-label="Build {hunt.title}"
					>
						{hunt.title}
					</a>
					<p class="text-sm text-stone-600">{hunt.setting} · {hunt.clueCount} clues</p>
				</div>
				<a
					href="/hunts/{hunt.id}/share"
					class="text-sm text-emerald-700 underline"
					aria-label="Share {hunt.title}"
				>
					Share
				</a>
			</li>
		{/each}
	</ul>
</section>
