<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Treasure</title>
</svelte:head>

<div class="min-h-screen bg-stone-50 text-stone-900">
	<header class="border-b border-stone-200 bg-white">
		<div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
			<a href="/" class="text-xl font-bold tracking-tight text-emerald-800" aria-label="Treasure home">
				Treasure
			</a>
			<nav class="flex flex-wrap items-center gap-4 text-sm" aria-label="Primary">
				<a href="/how-it-works" class="hover:text-emerald-700">How it works</a>
				<a href="/hunts" class="hover:text-emerald-700">My hunts</a>
				<a href="/play/DEMO" class="hover:text-emerald-700">Play</a>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-4 py-8">
		<slot />
	</main>
</div>
