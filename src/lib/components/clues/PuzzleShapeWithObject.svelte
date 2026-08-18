<script lang="ts">
	export let shapeSrc: string;
	export let objectSrc: string;
	export let colour: string | null = null;
	export let shapeId: string | null = null;
	export let sizeClass = 'h-16 w-16';

	const innerInsetByShape: Record<string, string> = {
		circle: '22%',
		square: '18%',
		triangle: '34% 24% 16% 24%',
		star: '28%'
	};

	$: shapeFill = colour ?? '#D6D3D1';
	$: objectFill = colour ? '#FAFAF9' : '#44403C';
	$: inset = (shapeId && innerInsetByShape[shapeId]) || '22%';

	const maskStyle = (src: string, background: string): string => {
		return `background-color: ${background}; mask-image: url('${src}'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-image: url('${src}'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;`;
	};
</script>

<span class="relative inline-block {sizeClass}" aria-hidden="true">
	<span class="absolute inset-0" style={maskStyle(shapeSrc, shapeFill)}></span>
	<span
		class="absolute overflow-hidden"
		style={`inset: ${inset}; mask-image: url('${shapeSrc}'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-image: url('${shapeSrc}'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;`}
	>
		<span class="block h-full w-full" style={maskStyle(objectSrc, objectFill)}></span>
	</span>
</span>
