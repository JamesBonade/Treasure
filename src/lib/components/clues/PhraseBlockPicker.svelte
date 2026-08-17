<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
	import type { ClueBlock } from '$lib/data/clueBlocks';

	export let id: string;
	export let label: string;
	export let example: string;
	export let value: string;
	export let blocks: ClueBlock[];
	export let freeform = false;
	export let quickPickCount = 6;

	const dispatch = createEventDispatcher<{ change: string }>();

	let isOpen = false;
	let searchQuery = '';
	let searchInput: HTMLInputElement | undefined;
	let mainInput: HTMLInputElement | undefined;
	let listEl: HTMLUListElement | undefined;

	$: isExample = value.trim() === '';
	$: selectedText = value.trim();
	$: quickPickBlocks = freeform ? blocks : blocks.slice(0, quickPickCount);
	$: showFullPicker = !freeform && blocks.length > quickPickBlocks.length;
	$: normalisedQuery = searchQuery.trim().toLowerCase();
	$: filteredBlocks = normalisedQuery
		? blocks.filter((block) => block.text.toLowerCase().includes(normalisedQuery))
		: blocks;

	const scrollSelectedIntoView = () => {
		if (!selectedText || !listEl) return;
		listEl.querySelector(`[data-block-text="${CSS.escape(selectedText)}"]`)?.scrollIntoView({
			block: 'nearest'
		});
	};

	const openPanel = async () => {
		isOpen = true;
		searchQuery = '';
		await tick();
		searchInput?.focus();
		scrollSelectedIntoView();
	};

	const handleInput = (event: Event) => {
		const next = (event.currentTarget as HTMLInputElement).value;
		const nextValue = next === example ? '' : next;
		if (showFullPicker) isOpen = true;
		dispatch('change', nextValue);
	};

	const handleToggle = async () => {
		if (isOpen) {
			isOpen = false;
			searchQuery = '';
			return;
		}
		await openPanel();
	};

	const handleSearchInput = (event: Event) => {
		searchQuery = (event.currentTarget as HTMLInputElement).value;
	};

	const handlePick = (text: string) => {
		isOpen = false;
		searchQuery = '';
		dispatch('change', text);
		mainInput?.blur();
	};
</script>

<div class="min-w-0">
	<div class="mb-1 flex items-center justify-between gap-2">
		<label class="text-xs font-medium uppercase tracking-wide text-stone-500" for={id}>{label}</label>
		{#if showFullPicker}
			<button
				type="button"
				class="text-xs text-sky-800 hover:underline"
				aria-expanded={isOpen}
				aria-controls="blocks-{id}"
				aria-label="Choose {label}"
				on:click={handleToggle}
			>
				{isOpen ? 'Close' : 'Choose'}
			</button>
		{/if}
	</div>
	<input
		bind:this={mainInput}
		{id}
		type="text"
		class="w-full rounded border border-stone-300 bg-white px-2 py-1.5 text-sm"
		class:text-stone-400={isExample}
		class:italic={isExample}
		class:text-stone-900={!isExample}
		aria-label={label}
		{...(showFullPicker ? { 'aria-controls': `blocks-${id}` } : {})}
		value={isExample ? example : value}
		on:input={handleInput}
	/>
	{#if quickPickBlocks.length > 0}
		<div
			id="quick-{id}"
			class="mt-1.5 flex flex-wrap gap-1.5"
			role="listbox"
			aria-label="{label} quick picks"
		>
			{#each quickPickBlocks as block (block.n)}
				<button
					type="button"
					role="option"
					aria-selected={block.text === selectedText}
					class="max-w-full rounded-full border px-2.5 py-0.5 text-xs"
					class:border-emerald-700={block.text === selectedText}
					class:bg-emerald-50={block.text === selectedText}
					class:text-emerald-900={block.text === selectedText}
					class:border-stone-300={block.text !== selectedText}
					class:bg-white={block.text !== selectedText}
					class:text-stone-700={block.text !== selectedText}
					class:hover:border-stone-400={block.text !== selectedText}
					title={block.text}
					on:click={() => handlePick(block.text)}
				>
					<span class="block truncate">{block.text}</span>
				</button>
			{/each}
		</div>
	{/if}
	{#if isOpen && showFullPicker}
		<div id="blocks-{id}" class="mt-2 overflow-hidden rounded border border-stone-200 bg-stone-50">
			<input
				id="search-{id}"
				bind:this={searchInput}
				type="search"
				class="w-full border-b border-stone-200 bg-white px-2 py-1.5 text-sm"
				placeholder="Search {label.toLowerCase()}…"
				aria-label="Search {label}"
				value={searchQuery}
				autocomplete="off"
				on:input={handleSearchInput}
			/>
			<ul bind:this={listEl} class="max-h-48 overflow-y-auto text-sm">
				{#if filteredBlocks.length === 0}
					<li class="px-2 py-2 text-stone-500">No matching {label.toLowerCase()} phrases</li>
				{:else}
					{#each filteredBlocks as block (block.n)}
						<li>
							<button
								type="button"
								data-block-text={block.text}
								class="flex w-full gap-2 px-2 py-1.5 text-left hover:bg-white"
								class:bg-emerald-50={block.text === selectedText}
								class:font-medium={block.text === selectedText}
								aria-current={block.text === selectedText ? 'true' : undefined}
								on:mousedown|preventDefault
								on:click={() => handlePick(block.text)}
							>
								<span class="w-6 shrink-0 text-xs text-stone-400">{block.n}</span>
								<span>{block.text}</span>
							</button>
						</li>
					{/each}
				{/if}
			</ul>
		</div>
	{/if}
</div>
