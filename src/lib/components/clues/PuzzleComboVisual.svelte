<script lang="ts">
	import ColouredGlyph from '$lib/components/clues/ColouredGlyph.svelte';
	import PuzzleShapeWithObject from '$lib/components/clues/PuzzleShapeWithObject.svelte';
	import {
		colourHex,
		getObjectSrc,
		getShapeMaskSrc
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
	$: objectSrc = getObjectSrc(modules.object);
	$: shapeMaskSrc = getShapeMaskSrc(modules.shape);
	$: hasObject = Boolean(objectSrc);
	$: hasShape = Boolean(shapeMaskSrc);
	$: repeats = Array.from({ length: showRepeats ? safeCount : 1 }, (_, index) => index);
	$: tileSize = showRepeats ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-20 w-20';
	$: cardBg = colour && !hasObject && !hasShape ? colour : undefined;
</script>

<div
	class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg"
	class:bg-stone-100={!cardBg}
	style={cardBg ? `background-color: ${cardBg}` : undefined}
	aria-label={label}
>
	{#if hasObject}
		<div
			class="grid w-full place-items-center gap-1 p-2"
			class:grid-cols-1={safeCount === 1}
			class:grid-cols-2={safeCount > 1}
		>
			{#each repeats as _}
				<PuzzleShapeWithObject
					objectSrc={objectSrc ?? ''}
					objectId={modules.object}
					shapeId={modules.shape}
					{colour}
					sizeClass={tileSize}
				/>
			{/each}
		</div>
	{:else if hasShape}
		<div
			class="grid w-full place-items-center gap-1 p-2"
			class:grid-cols-1={safeCount === 1}
			class:grid-cols-2={safeCount > 1}
		>
			{#each repeats as _}
				<ColouredGlyph {shapeMaskSrc} {colour} sizeClass={tileSize} alt="" />
			{/each}
		</div>
	{:else if modules.number}
		<span class="text-4xl font-bold" style={colour ? `color: ${colour}` : ''}>{modules.number}</span>
	{:else if colour}
		<span class="h-14 w-14 rounded-2xl shadow-inner" style={`background-color: ${colour}`}></span>
	{/if}
</div>
