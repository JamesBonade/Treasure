<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
	import type { ClueBlock } from '$lib/data/clueBlocks';

	export let id: string;
	export let label: string;
	export let example: string;
	export let value: string;
	export let blocks: ClueBlock[];
	export let freeform = false;
	export let layout: 'compact' | 'phrase' = 'phrase';
	export let quickPickCount = 6;

	const dispatch = createEventDispatcher<{ change: string }>();

	let isOpen = false;
	let searchQuery = '';
	let showCustom = false;
	let searchInput: HTMLInputElement | undefined;
	let customInput: HTMLInputElement | undefined;
	let listEl: HTMLUListElement | undefined;

	$: isExample = value.trim() === '';
	$: selectedText = value.trim();
	$: displayText = isExample ? '' : value.trim();
	$: baseQuickPicks = freeform ? [] : blocks.slice(0, quickPickCount);
	$: quickPickBlocks =
		!selectedText || baseQuickPicks.some((block) => block.text === selectedText)
			? baseQuickPicks
			: (() => {
					const selectedBlock = blocks.find((block) => block.text === selectedText);
					if (!selectedBlock) return baseQuickPicks;
					return [selectedBlock, ...baseQuickPicks.slice(0, quickPickCount - 1)];
				})();
	$: showFullPicker = !freeform && blocks.length > 0;
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
		showCustom = false;
		dispatch('change', text);
	};

	const handleCustomInput = (event: Event) => {
		dispatch('change', (event.currentTarget as HTMLInputElement).value);
	};

	const handleShowCustom = async () => {
		showCustom = true;
		isOpen = false;
		await tick();
		customInput?.focus();
	};

	const chipClass =
		'rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition focus:outline-none focus:ring-2 focus:ring-brand-100';
</script>

<div class="border-b border-stone-100 py-3 last:border-b-0">
	{#if freeform}
		<div class="flex items-center gap-3">
			<label class="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-stone-500" for={id}>
				{label}
			</label>
			<input
				bind:this={customInput}
				{id}
				type="text"
				class="field-input min-w-0 flex-1 py-2 text-sm"
				class:field-input-muted={isExample}
				placeholder={example}
				aria-label={label}
				value={isExample ? '' : value}
				on:input={handleCustomInput}
			/>
		</div>
	{:else if showCustom}
		<div class="flex items-center gap-3">
			<span class="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-stone-500">{label}</span>
			<input
				bind:this={customInput}
				{id}
				type="text"
				class="field-input min-w-0 flex-1 py-2 text-sm"
				placeholder="Custom…"
				aria-label="Custom {label}"
				value={isExample ? '' : value}
				on:input={handleCustomInput}
			/>
			<button type="button" class="shrink-0 text-xs text-stone-500 hover:text-stone-700" on:click={() => (showCustom = false)}>
				Picks
			</button>
		</div>
	{:else}
		<div class="space-y-2">
			<div class="flex items-start gap-2 sm:items-center">
				<span class="w-16 shrink-0 pt-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500 sm:pt-0">
					{label}
				</span>

				{#if layout === 'compact'}
					<div id="quick-{id}" class="flex min-w-0 flex-1 flex-wrap gap-1.5" role="listbox" aria-label="{label}">
						{#each quickPickBlocks as block (block.n)}
							<button
								type="button"
								role="option"
								aria-selected={block.text === selectedText}
								class={chipClass}
								class:border-brand-600={block.text === selectedText}
								class:bg-brand-600={block.text === selectedText}
								class:text-white={block.text === selectedText}
								class:border-stone-200={block.text !== selectedText}
								class:bg-white={block.text !== selectedText}
								class:text-stone-700={block.text !== selectedText}
								class:hover:border-brand-300={block.text !== selectedText}
								on:click={() => handlePick(block.text)}
							>
								{block.text}
							</button>
						{/each}
					</div>
				{:else}
					<div
						id="quick-{id}"
						class="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5"
						role="listbox"
						aria-label="{label}"
					>
						{#each quickPickBlocks as block (block.n)}
							<button
								type="button"
								role="option"
								aria-selected={block.text === selectedText}
								class="{chipClass} shrink-0"
								class:border-brand-600={block.text === selectedText}
								class:bg-brand-600={block.text === selectedText}
								class:text-white={block.text === selectedText}
								class:border-stone-200={block.text !== selectedText}
								class:bg-white={block.text !== selectedText}
								class:text-stone-700={block.text !== selectedText}
								class:hover:border-brand-300={block.text !== selectedText}
								on:click={() => handlePick(block.text)}
							>
								{block.text}
							</button>
						{/each}
					</div>
				{/if}

				<div class="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center">
					{#if showFullPicker}
						<button
							type="button"
							class="text-xs font-medium text-brand-700 hover:text-brand-900"
							aria-expanded={isOpen}
							aria-controls="blocks-{id}"
							on:click={handleToggle}
						>
							{isOpen ? '−' : '+'}
						</button>
					{/if}
					<button type="button" class="text-xs text-stone-400 hover:text-stone-600" on:click={handleShowCustom}>
						✎
					</button>
				</div>
			</div>

			{#if displayText}
				<p class="ml-[4.5rem] truncate rounded-lg bg-brand-50 px-2.5 py-1.5 text-sm font-medium text-brand-900" aria-live="polite">
					{displayText}
				</p>
			{/if}
		</div>
	{/if}

	{#if isOpen && showFullPicker}
		<div id="blocks-{id}" class="mt-2 overflow-hidden rounded-lg border border-stone-200">
			<input
				id="search-{id}"
				bind:this={searchInput}
				type="search"
				class="w-full border-b border-stone-100 bg-stone-50 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none"
				placeholder="Search…"
				aria-label="Search {label}"
				value={searchQuery}
				autocomplete="off"
				on:input={handleSearchInput}
			/>
			<ul bind:this={listEl} class="max-h-40 overflow-y-auto text-sm">
				{#if filteredBlocks.length === 0}
					<li class="px-3 py-2 text-stone-500">No matches</li>
				{:else}
					{#each filteredBlocks as block (block.n)}
						<li>
							<button
								type="button"
								data-block-text={block.text}
								class="flex w-full px-3 py-2 text-left transition hover:bg-stone-50"
								class:bg-brand-50={block.text === selectedText}
								class:font-medium={block.text === selectedText}
								class:text-brand-900={block.text === selectedText}
								on:mousedown|preventDefault
								on:click={() => handlePick(block.text)}
							>
								{block.text}
							</button>
						</li>
					{/each}
				{/if}
			</ul>
		</div>
	{/if}
</div>
