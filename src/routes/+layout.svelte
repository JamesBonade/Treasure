<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import favicon from '$lib/assets/favicon.svg';

	$: path = $page.url.pathname;
	$: isPlayRoute = path.startsWith('/play');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Treasure</title>
</svelte:head>

{#if isPlayRoute}
	<slot />
{:else}
	<div class="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-100">
	<header class="sticky top-0 z-40 border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
			<a
				href="/"
				class="flex items-center gap-2 text-lg font-bold tracking-tight text-brand-900"
				aria-label="Treasure home"
			>
				<span
					class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-700 text-sm text-white shadow-sm"
					aria-hidden="true"
				>
					T
				</span>
				Treasure
			</a>
			<nav class="flex flex-wrap items-center gap-1" aria-label="Primary">
				<a href="/how-it-works" class="nav-link" class:!bg-brand-50={path === '/how-it-works'}
					>How it works</a
				>
				<a href="/hunts" class="nav-link" class:!bg-brand-50={path.startsWith('/hunts')}>My hunts</a>
				<a href="/play" class="nav-link" class:!bg-brand-50={path.startsWith('/play')}>Play</a>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
		<slot />
	</main>
</div>
{/if}
