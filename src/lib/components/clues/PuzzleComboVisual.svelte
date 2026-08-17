<script lang="ts">
	import ColouredGlyph from '$lib/components/clues/ColouredGlyph.svelte';
	import {
		colourHex,
		getObjectMaskSrc,
		getObjectSrc,
		getShapeMaskSrc,
		getShapeSrc
	} from '$lib/data/puzzleModules';
	import type { PuzzleModules } from '$lib/types/clues';

	export let modules: PuzzleModules;
	export let label: string;

	$: parsedCount = modules.number ? Number(modules.number) : null;
	$: safeCount =
		parsedCount !== null && !Number.isNaN(parsedCount) && parsedCount > 0
			? Math.min(parsedCount, 4)
			: 1;
	$: showRepeats = Boolean(modules.number && (modules.object || modules.shape));
	$: colour = modules.colour ? colourHex[modules.colour] ?? null : null;
	$: objectArt = colour ? getObjectMaskSrc(modules.object) : getObjectSrc(modules.object);
	$: shapeArt = colour ? getShapeMaskSrc(modules.shape) : getShapeSrc(modules.shape);
	$: primarySrc = objectArt ?? shapeArt;
	$: shapeBadgeSrc = colour ? getShapeMaskSrc(modules.shape) : getShapeSrc(modules.shape);
	$: repeats = Array.from({ length: showRepeats ? safeCount : 1 }, (_, index) => index);
</script>

<div
	class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-stone-100"
	aria-label={label}
>
	{#if primarySrc && showRepeats}
		<div
			class="grid w-full place-items-center gap-1 p-2"
			class:grid-cols-1={safeCount === 1}
			class:grid-cols-2={safeCount > 1}
		>
			{#each repeats as _}
				<ColouredGlyph
					src={primarySrc}
					{colour}
					sizeClass="h-10 w-10 sm:h-12 sm:w-12"
					alt=""
				/>
			{/each}
		</div>
	{:else if primarySrc}
		<ColouredGlyph src={primarySrc} {colour} sizeClass="h-16 w-16" alt="" />
	{:else if modules.number}
		<span class="text-4xl font-bold" style={colour ? `color: ${colour}` : ''}>{modules.number}</span>
	{:else if colour}
		<span class="h-14 w-14 rounded-md" style={`background-color: ${colour}`}></span>
	{/if}

	{#if modules.shape && objectArt && shapeBadgeSrc}
		<span class="absolute bottom-1 right-1 rounded bg-white/90 p-0.5">
			<ColouredGlyph src={shapeBadgeSrc} {colour} sizeClass="h-7 w-7" alt="" />
		</span>
	{/if}
</div>
