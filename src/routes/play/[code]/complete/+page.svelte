<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	$: hunt = data.hunt;
	$: preview = data.preview;
	$: editPath = hunt ? `/hunts/${hunt.id}` : '/hunts';
</script>

{#if !hunt}
	<section class="mx-auto max-w-md space-y-4 text-center">
		<h1 class="text-2xl font-bold text-stone-900">Hunt not found</h1>
		<a href={preview ? editPath : '/'} class="btn-primary inline-flex">
			{preview ? 'Back to builder' : 'Back home'}
		</a>
	</section>
{:else}
	<section class="mx-auto flex w-full max-w-lg flex-col items-center justify-center text-center">
		<div
			class="w-full max-w-lg rounded-3xl border border-brand-100 bg-gradient-to-br from-white via-brand-50/50 to-white px-8 py-12 shadow-soft sm:px-10 sm:py-14"
		>
			<p class="text-5xl" aria-hidden="true">🏆</p>
			{#if preview}
				<p class="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Preview complete</p>
			{:else}
				<p class="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-700">{hunt.title}</p>
			{/if}
			<h1 class="mt-3 text-4xl font-bold text-stone-900 sm:text-5xl">Treasure found!</h1>
			<p class="mt-4 text-lg text-stone-600">
				You solved all {hunt.clues.length} clues. Time to celebrate!
			</p>
			<div class="mt-8 flex flex-wrap justify-center gap-3">
				{#if preview}
					<a href={editPath} class="btn-primary">Back to builder</a>
					<a href="/play/{hunt.code}/clue/1?preview=1" class="btn-secondary">Preview again</a>
				{:else}
					<a href="/play/{hunt.code}/clue/1" class="btn-primary">Play again</a>
					<a href="/hunts" class="btn-secondary">More hunts</a>
				{/if}
			</div>
		</div>
	</section>
{/if}
