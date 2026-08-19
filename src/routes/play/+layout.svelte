<script lang="ts">
	import '../layout.css';
	import { page } from '$app/stores';
	import favicon from '$lib/assets/favicon.svg';

	$: isClueRoute = /\/clue\/\d+/.test($page.url.pathname);
	$: isCompleteRoute = $page.url.pathname.endsWith('/complete');
	$: isFocusedPlay = isClueRoute || isCompleteRoute;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Treasure · Play</title>
</svelte:head>

<div
	class="min-h-screen"
	class:bg-gradient-to-b={!isFocusedPlay}
	class:from-brand-50={!isFocusedPlay}
	class:via-white={!isFocusedPlay}
	class:to-stone-100={!isFocusedPlay}
	class:bg-stone-50={isFocusedPlay}
>
	{#if !isFocusedPlay}
		<header class="border-b border-stone-200/80 bg-white/70 px-4 py-3 backdrop-blur-md sm:px-6">
			<div class="mx-auto flex max-w-2xl items-center justify-between gap-3">
				<a href="/" class="flex items-center gap-2 text-sm font-semibold text-brand-900" aria-label="Treasure home">
					<span
						class="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700 text-xs text-white"
						aria-hidden="true"
					>
						T
					</span>
					Treasure
				</a>
				<span class="text-xs font-medium uppercase tracking-wider text-stone-500">Play mode</span>
			</div>
		</header>
	{/if}

	<main
		class="mx-auto flex min-h-screen flex-col px-4 sm:px-6"
		class:max-w-2xl={!isFocusedPlay}
		class:py-8={!isFocusedPlay}
		class:sm:py-10={!isFocusedPlay}
		class:max-w-xl={isFocusedPlay}
		class:justify-center={isFocusedPlay}
		class:py-6={isFocusedPlay}
		class:sm:py-8={isFocusedPlay}
	>
		<slot />
	</main>
</div>
