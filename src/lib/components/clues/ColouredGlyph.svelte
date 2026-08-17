<script lang="ts">
	export let src: string;
	export let colour: string | null = null;
	export let sizeClass = 'h-12 w-12';
	export let alt = '';
</script>

{#if colour}
	<span
		class="inline-block {sizeClass}"
		role="img"
		aria-label={alt}
		style={`background-color: ${colour}; mask-image: url('${src}'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-image: url('${src}'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;`}
	></span>
{:else}
	<img {src} {alt} class="{sizeClass} object-contain" />
{/if}
