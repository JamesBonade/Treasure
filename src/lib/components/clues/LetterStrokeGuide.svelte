<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import {
		getLetterStrokes,
		LETTER_ASCENDER,
		LETTER_BASELINE,
		LETTER_MIDLINE,
		LETTER_VIEW_H,
		LETTER_VIEW_W
	} from '$lib/data/letterStrokes';

	export let text = '';
	export let loop = true;
	/** Compact for builder preview; roomy for play. */
	export let compact = false;

	type AnimatedStroke = {
		id: string;
		d: string;
		length: number;
		delay: number;
		duration: number;
	};

	type AnimatedLetter = {
		key: string;
		char: string;
		strokes: AnimatedStroke[];
	};

	let letters: AnimatedLetter[] = [];
	let cycleKey = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let measureSvg: SVGSVGElement | undefined;
	let builtFor = '';

	$: chars = text
		.toLowerCase()
		.split('')
		.filter((char) => /[a-z]/.test(char));

	const measurePath = (d: string): number => {
		if (typeof document === 'undefined') return 120;
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', d);
		if (!measureSvg) {
			measureSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			measureSvg.setAttribute('aria-hidden', 'true');
			measureSvg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
			document.body.appendChild(measureSvg);
		}
		measureSvg.appendChild(path);
		const length = path.getTotalLength() || 120;
		measureSvg.removeChild(path);
		return length;
	};

	const buildLetters = async () => {
		await tick();
		const source = chars.join('');
		builtFor = `${source}:${cycleKey}`;
		let delay = 0;
		letters = chars.map((char, letterIndex) => {
			const strokes = getLetterStrokes(char).map((stroke, strokeIndex) => {
				const length = measurePath(stroke.d);
				const duration = Math.min(1.4, Math.max(0.55, length / 140));
				const item = {
					id: `${cycleKey}-${letterIndex}-${strokeIndex}`,
					d: stroke.d,
					length,
					delay,
					duration
				};
				delay += duration + 0.12;
				return item;
			});
			delay += 0.28;
			return { key: `${cycleKey}-${letterIndex}-${char}`, char, strokes };
		});

		if (loop && letters.length > 0) {
			window.clearTimeout(timer);
			timer = window.setTimeout(() => {
				cycleKey += 1;
				buildLetters();
			}, delay * 1000 + 700);
		}
	};

	$: if (chars.join('') !== builtFor.split(':')[0]) {
		cycleKey = 0;
		window.clearTimeout(timer);
		buildLetters();
	}

	onMount(() => {
		buildLetters();
	});

	onDestroy(() => {
		window.clearTimeout(timer);
		measureSvg?.remove();
	});

	$: letterWidth = compact
		? chars.length > 6
			? 32
			: chars.length > 3
				? 40
				: 48
		: chars.length > 6
			? 56
			: chars.length > 3
				? 72
				: chars.length > 1
					? 88
					: 120;
	$: letterHeight = compact
		? chars.length > 6
			? 64
			: 76
		: chars.length > 6
			? 132
			: chars.length > 1
				? 148
				: 172;
</script>

{#if chars.length > 0}
	<div class="relative inline-flex justify-center" aria-hidden="true">
		<svg
			class="pointer-events-none absolute inset-0 h-full w-full"
			viewBox="0 0 {LETTER_VIEW_W} {LETTER_VIEW_H}"
			preserveAspectRatio="none"
		>
			<line
				x1="0"
				y1={LETTER_ASCENDER}
				x2={LETTER_VIEW_W}
				y2={LETTER_ASCENDER}
				stroke="#E7E5E4"
				stroke-width="2.5"
				vector-effect="non-scaling-stroke"
			/>
			<line
				x1="0"
				y1={LETTER_MIDLINE}
				x2={LETTER_VIEW_W}
				y2={LETTER_MIDLINE}
				stroke="#E7E5E4"
				stroke-width="2.5"
				vector-effect="non-scaling-stroke"
			/>
			<line
				x1="0"
				y1={LETTER_BASELINE}
				x2={LETTER_VIEW_W}
				y2={LETTER_BASELINE}
				stroke="#E7E5E4"
				stroke-width="2.5"
				vector-effect="non-scaling-stroke"
			/>
		</svg>
		<div class="relative flex flex-wrap items-end justify-center gap-1 sm:gap-2">
			{#each letters as letter (letter.key)}
				<svg
					viewBox="0 0 {LETTER_VIEW_W} {LETTER_VIEW_H}"
					width={letterWidth}
					height={letterHeight}
					class="overflow-visible"
				>
					{#each letter.strokes as stroke}
						<path
							d={stroke.d}
							fill="none"
							stroke="#E7E5E4"
							stroke-width="7"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					{/each}
					{#each letter.strokes as stroke (stroke.id)}
						<path
							class="trace-stroke"
							d={stroke.d}
							fill="none"
							stroke="#047857"
							stroke-width="5"
							stroke-linecap="round"
							stroke-linejoin="round"
							style={`stroke-dasharray: ${stroke.length}; stroke-dashoffset: ${stroke.length}; animation-duration: ${stroke.duration}s; animation-delay: ${stroke.delay}s;`}
						/>
					{/each}
				</svg>
			{/each}
		</div>
	</div>
{/if}

<style>
	.trace-stroke {
		animation-name: trace-write;
		animation-timing-function: ease-in-out;
		animation-fill-mode: forwards;
	}

	@keyframes trace-write {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
