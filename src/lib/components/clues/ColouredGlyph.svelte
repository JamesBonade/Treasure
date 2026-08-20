<script lang="ts">
	/** Full picture glyph, or a coloured shape backdrop (no animal recolouring). */
	export let src: string | null = null;
	export let colour: string | null = null;
	export let shapeMaskSrc: string | null = null;
	export let sizeClass = 'h-12 w-12';
	export let alt = '';
</script>

{#if shapeMaskSrc}
	<span
		class="inline-block {sizeClass}"
		role="img"
		aria-label={alt}
		style={`background-color: ${colour ?? '#A8A29E'}; mask-image: url('${shapeMaskSrc}'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-image: url('${shapeMaskSrc}'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;`}
	></span>
{:else if src}
	<span
		class="inline-flex {sizeClass} items-center justify-center overflow-hidden rounded-2xl"
		style={colour ? `background-color: ${colour}` : undefined}
		class:bg-stone-100={!colour}
	>
		<img {src} {alt} class="h-[78%] w-[78%] object-contain" />
	</span>
{/if}
