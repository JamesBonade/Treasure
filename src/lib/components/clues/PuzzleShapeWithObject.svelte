<script lang="ts">
	import { getObjectMaskSrc, getShapeMaskSrc } from '$lib/data/puzzleModules';

	export let shapeId: string | null = null;
	export let objectId: string | null = null;
	export let objectSrc: string;
	export let colour: string | null = null;
	export let sizeClass = 'h-16 w-16';

	const imageInsetByShape: Record<string, string> = {
		circle: '18%',
		square: '14%',
		triangle: '30% 22% 14% 22%',
		star: '24%',
		heart: '26% 20% 18% 20%',
		diamond: '26%',
		oval: '22% 18%',
		hexagon: '20%'
	};

	$: shapeSrc = getShapeMaskSrc(shapeId);
	$: objectMaskSrc = getObjectMaskSrc(objectId);
	$: fillObject = Boolean(colour && objectMaskSrc);
	$: shapeFill = '#E7E5E4';
	$: inset = (shapeId && imageInsetByShape[shapeId]) || '16%';

	const maskStyle = (src: string, background: string): string =>
		`background-color: ${background}; mask-image: url('${src}'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-image: url('${src}'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;`;
</script>

<span class="relative inline-block {sizeClass}" aria-hidden="true">
	{#if shapeSrc}
		<span class="absolute inset-0" style={maskStyle(shapeSrc, shapeFill)}></span>
		<span class="absolute overflow-hidden" style={`inset: ${inset};`}>
			{#if fillObject && objectMaskSrc && colour}
				<span class="block h-full w-full" style={maskStyle(objectMaskSrc, colour)}></span>
			{:else}
				<img src={objectSrc} alt="" class="h-full w-full object-contain" />
			{/if}
		</span>
	{:else if fillObject && objectMaskSrc && colour}
		<span class="absolute inset-0 rounded-2xl bg-stone-100"></span>
		<span class="absolute inset-[12%]" style={maskStyle(objectMaskSrc, colour)}></span>
	{:else}
		<span class="absolute inset-0 rounded-2xl bg-stone-100"></span>
		<span class="absolute inset-[12%]">
			<img src={objectSrc} alt="" class="h-full w-full object-contain" />
		</span>
	{/if}
</span>
