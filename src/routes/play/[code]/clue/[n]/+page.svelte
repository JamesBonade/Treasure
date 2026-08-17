<script lang="ts">
	import { page } from '$app/stores';

	$: code = $page.params.code ?? 'unknown';
	$: n = $page.params.n ?? '1';
	$: clueNum = Number(n) || 1;
	$: nextHref =
		clueNum >= 3 ? `/play/${code}/complete` : `/play/${code}/clue/${clueNum + 1}`;

	let answer = '';

	const handleSubmitAnswer = () => {
		// Shell only
	};

	const handleFoundIt = () => {
		// Shell only
	};
</script>

<section class="space-y-8">
	<div class="space-y-1">
		<p class="text-sm text-stone-500">Code {code} · Clue {n} of 3 (shell)</p>
		<h1 class="text-3xl font-bold text-emerald-900">Current clue</h1>
	</div>

	<div class="grid gap-6 sm:grid-cols-3">
		<div class="space-y-2 border-t border-stone-200 pt-3">
			<h2 class="font-semibold">Written</h2>
			<p class="text-stone-600">“I have roots that nobody sees, taller than trees…”</p>
		</div>
		<div class="space-y-2 border-t border-stone-200 pt-3">
			<h2 class="font-semibold">Puzzle</h2>
			<p class="text-stone-600">Placeholder puzzle panel — rearrange letters or solve a riddle.</p>
		</div>
		<div class="space-y-2 border-t border-stone-200 pt-3">
			<h2 class="font-semibold">Map</h2>
			<div
				class="flex h-28 items-center justify-center border border-dashed border-stone-300 bg-stone-100 text-sm text-stone-500"
				aria-label="Map placeholder"
			>
				Map sketch placeholder
			</div>
		</div>
	</div>

	<label class="block max-w-md space-y-1">
		<span class="text-sm font-medium">Your answer</span>
		<input
			bind:value={answer}
			type="text"
			class="w-full rounded border border-stone-300 px-3 py-2"
			aria-label="Submit answer for clue {n}"
		/>
	</label>

	<div class="flex flex-wrap gap-3">
		<a
			href={nextHref}
			class="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
			aria-label="Submit answer and continue"
			on:click={handleSubmitAnswer}
		>
			Submit answer
		</a>
		<a
			href={nextHref}
			class="rounded border border-emerald-700 px-4 py-2 text-emerald-800 hover:bg-emerald-50"
			aria-label="Mark clue as found"
			on:click={handleFoundIt}
		>
			I found it
		</a>
	</div>
</section>
