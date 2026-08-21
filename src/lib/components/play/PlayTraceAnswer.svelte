<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import LetterStrokeGuide from '$lib/components/clues/LetterStrokeGuide.svelte';
	import {
		getLetterStrokes,
		LETTER_ASCENDER,
		LETTER_BASELINE,
		LETTER_MIDLINE,
		LETTER_VIEW_H,
		LETTER_VIEW_W
	} from '$lib/data/letterStrokes';
	import { buildTracePrompt, normaliseTraceText } from '$lib/data/traceTargets';
	import type { FamilyClue } from '$lib/types/clues';
	import { speakText } from '$lib/utils/speech';
	import {
		scoreTracePath,
		type TraceDrawPoint,
		type TraceGuidePoint,
		type TraceScoreResult
	} from '$lib/utils/traceScore';

	export let clue: FamilyClue;

	const dispatch = createEventDispatcher<{ solved: void }>();
	/** Must cover most of the guide before Done unlocks. */
	const READY_RATIO = 0.85;
	/** Ignore Done taps briefly after drawing so a finger-up can't click through. */
	const SETTLE_MS = 650;
	const ENCOURAGE_MILESTONES = [
		{ at: 0.2, message: 'Nice start!' },
		{ at: 0.45, message: 'Keep going!' },
		{ at: 0.7, message: "You're doing great!" },
		{ at: READY_RATIO, message: 'Almost there!' }
	] as const;

	let canvasEl: HTMLCanvasElement | undefined;
	let wrapEl: HTMLDivElement | undefined;
	let drawing = false;
	let settled = true;
	let progress = 0;
	let completed = false;
	let feedback = '';
	let encourageMessage = '';
	let encourageIndex = 0;
	let scoreResult: TraceScoreResult | null = null;
	let solveTimer: ReturnType<typeof setTimeout> | undefined;
	let settleTimer: ReturnType<typeof setTimeout> | undefined;
	let donePointerId: number | null = null;

	type SamplePoint = TraceGuidePoint & { hit: boolean };
	let samples: SamplePoint[] = [];
	let drawPoints: TraceDrawPoint[] = [];
	let ctx: CanvasRenderingContext2D | null = null;
	let width = 0;
	let height = 0;
	let hitRadius = 20;
	let penWidth = 6;
	let measureSvg: SVGSVGElement | undefined;
	let lastRecorded: TraceDrawPoint | null = null;

	$: text = normaliseTraceText(clue.answer);
	$: prompt = buildTracePrompt(clue.traceMode, text);
	$: chars = text.split('').filter((char) => /[a-z]/i.test(char));
	$: isReady = !completed && !drawing && settled && progress >= READY_RATIO;

	const ensureMeasureSvg = () => {
		if (measureSvg || typeof document === 'undefined') return measureSvg;
		measureSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		measureSvg.setAttribute('aria-hidden', 'true');
		measureSvg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
		document.body.appendChild(measureSvg);
		return measureSvg;
	};

	const mapLetterLayout = () => {
		const count = Math.max(1, chars.length);
		const sidePad = Math.max(20, width * 0.04);
		const topPad = Math.max(24, height * 0.07);
		const bottomPad = Math.max(24, height * 0.07);
		const usableW = width - sidePad * 2;
		const usableH = height - topPad - bottomPad;
		const cellW = usableW / count;
		const letterH = usableH * 0.78;
		const letterW = Math.min(cellW * 0.92, letterH * (LETTER_VIEW_W / LETTER_VIEW_H));
		const startX = sidePad + (usableW - letterW * count) / 2;
		const startY = topPad + (usableH - letterH) / 2;

		return {
			startX,
			startY,
			letterW,
			letterH,
			toCanvas: (letterIndex: number, x: number, y: number) => ({
				x: startX + letterIndex * letterW + (x / LETTER_VIEW_W) * letterW,
				y: startY + (y / LETTER_VIEW_H) * letterH
			}),
			lineY: (guideY: number) => startY + (guideY / LETTER_VIEW_H) * letterH
		};
	};

	const withMappedPath = (
		d: string,
		letterIndex: number,
		layout: ReturnType<typeof mapLetterLayout>,
		step: number,
		onPoint: (x: number, y: number, dist: number, length: number) => void
	): number => {
		const svg = ensureMeasureSvg();
		if (!svg) return 0;
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', d);
		svg.appendChild(path);
		const length = path.getTotalLength() || 0;
		if (length <= 0) {
			svg.removeChild(path);
			return 0;
		}
		for (let dist = 0; dist < length; dist += step) {
			const pt = path.getPointAtLength(dist);
			const mapped = layout.toCanvas(letterIndex, pt.x, pt.y);
			onPoint(mapped.x, mapped.y, dist, length);
		}
		const end = path.getPointAtLength(length);
		const mappedEnd = layout.toCanvas(letterIndex, end.x, end.y);
		onPoint(mappedEnd.x, mappedEnd.y, length, length);
		svg.removeChild(path);
		return length;
	};

	const inkMetrics = (layout: ReturnType<typeof mapLetterLayout>) => {
		const bodyWidth = Math.max(
			8,
			Math.round(Math.min(layout.letterW * 0.16, layout.letterH * 0.07))
		);
		return {
			bodyWidth,
			guideWidth: Math.max(3, Math.round(bodyWidth * 0.42)),
			penWidth: Math.max(4, Math.round(bodyWidth * 0.45)),
			hitRadius: Math.max(18, Math.round(bodyWidth * 1.15))
		};
	};

	const canvasPathStep = (layout: ReturnType<typeof mapLetterLayout>): number => {
		const scale = Math.max(
			layout.letterW / LETTER_VIEW_W,
			layout.letterH / LETTER_VIEW_H,
			0.5
		);
		return 4 / scale;
	};

	const sampleStroke = (
		d: string,
		letterIndex: number,
		strokeIndex: number,
		layout: ReturnType<typeof mapLetterLayout>,
		step: number
	) => {
		const points: SamplePoint[] = [];
		withMappedPath(d, letterIndex, layout, step, (x, y, dist, length) => {
			points.push({
				x,
				y,
				strokeIndex,
				t: length > 0 ? dist / length : 0,
				hit: false
			});
		});
		return points;
	};

	const drawGuideLines = (layout: ReturnType<typeof mapLetterLayout>) => {
		if (!ctx) return;
		ctx.save();
		ctx.strokeStyle = '#D6D3D1';
		ctx.lineWidth = 2;
		ctx.setLineDash([]);
		for (const y of [LETTER_ASCENDER, LETTER_MIDLINE, LETTER_BASELINE]) {
			const gy = layout.lineY(y);
			ctx.beginPath();
			ctx.moveTo(16, gy);
			ctx.lineTo(width - 16, gy);
			ctx.stroke();
		}
		ctx.restore();
	};

	const strokeLetterPaths = (
		layout: ReturnType<typeof mapLetterLayout>,
		step: number
	) => {
		const canvasCtx = ctx;
		if (!canvasCtx) return;
		chars.forEach((char, letterIndex) => {
			for (const stroke of getLetterStrokes(char)) {
				let started = false;
				canvasCtx.beginPath();
				withMappedPath(stroke.d, letterIndex, layout, step, (x, y) => {
					if (!started) {
						canvasCtx.moveTo(x, y);
						started = true;
						return;
					}
					canvasCtx.lineTo(x, y);
				});
				if (started) canvasCtx.stroke();
			}
		});
	};

	const drawLetterGuides = (layout: ReturnType<typeof mapLetterLayout>) => {
		if (!ctx) return;
		const { bodyWidth, guideWidth } = inkMetrics(layout);
		const step = canvasPathStep(layout);

		ctx.save();
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		ctx.strokeStyle = '#E7E5E4';
		ctx.lineWidth = bodyWidth;
		ctx.setLineDash([]);
		strokeLetterPaths(layout, step);

		ctx.strokeStyle = '#047857';
		ctx.globalAlpha = 0.55;
		ctx.lineWidth = guideWidth;
		ctx.setLineDash([8, 6]);
		strokeLetterPaths(layout, step);

		ctx.restore();
	};

	const rebuildGuide = () => {
		if (!canvasEl || !wrapEl || !text) return;
		const rect = wrapEl.getBoundingClientRect();
		width = Math.max(320, Math.floor(rect.width));
		height = Math.max(360, Math.min(480, Math.floor(window.innerHeight * 0.42)));

		const dpr = window.devicePixelRatio || 1;
		canvasEl.width = width * dpr;
		canvasEl.height = height * dpr;
		canvasEl.style.width = `${width}px`;
		canvasEl.style.height = `${height}px`;

		ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, width, height);

		const layout = mapLetterLayout();
		const ink = inkMetrics(layout);
		penWidth = ink.penWidth;
		hitRadius = ink.hitRadius;

		ctx.fillStyle = '#FAFAF9';
		ctx.fillRect(0, 0, width, height);

		drawGuideLines(layout);
		drawLetterGuides(layout);

		const step = canvasPathStep(layout);
		const next: SamplePoint[] = [];
		let strokeIndex = 0;
		chars.forEach((char, letterIndex) => {
			for (const stroke of getLetterStrokes(char)) {
				next.push(...sampleStroke(stroke.d, letterIndex, strokeIndex, layout, step));
				strokeIndex += 1;
			}
		});
		samples = next;
		drawPoints = [];
		lastRecorded = null;
		progress = 0;
		completed = false;
		feedback = '';
		encourageMessage = '';
		encourageIndex = 0;
		scoreResult = null;
		drawing = false;
		settled = true;
		donePointerId = null;
		window.clearTimeout(settleTimer);
	};

	const pointerPos = (event: PointerEvent) => {
		if (!canvasEl) return { x: 0, y: 0 };
		const rect = canvasEl.getBoundingClientRect();
		return {
			x: ((event.clientX - rect.left) / rect.width) * width,
			y: ((event.clientY - rect.top) / rect.height) * height
		};
	};

	const recordDrawPoint = (x: number, y: number) => {
		if (lastRecorded) {
			const dx = x - lastRecorded.x;
			const dy = y - lastRecorded.y;
			if (dx * dx + dy * dy < 16) return;
		}
		lastRecorded = { x, y };
		drawPoints.push({ x, y });
	};

	const maybeEncourage = () => {
		if (completed) return;
		while (
			encourageIndex < ENCOURAGE_MILESTONES.length &&
			progress >= ENCOURAGE_MILESTONES[encourageIndex].at
		) {
			const next = ENCOURAGE_MILESTONES[encourageIndex];
			encourageMessage = next.message;
			speakText(next.message);
			encourageIndex += 1;
		}
	};

	const markCoverage = (x: number, y: number) => {
		const radiusSq = hitRadius * hitRadius;
		let changed = false;
		for (const sample of samples) {
			if (sample.hit) continue;
			const dx = sample.x - x;
			const dy = sample.y - y;
			if (dx * dx + dy * dy <= radiusSq) {
				sample.hit = true;
				changed = true;
			}
		}
		if (!changed) return;

		const hitCount = samples.filter((sample) => sample.hit).length;
		progress = samples.length ? hitCount / samples.length : 0;
		maybeEncourage();
	};

	const paintStroke = (x: number, y: number) => {
		if (!ctx) return;

		ctx.setLineDash([]);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.strokeStyle = '#047857';
		ctx.lineWidth = penWidth;
		ctx.lineTo(x, y);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(x, y);
		recordDrawPoint(x, y);
		markCoverage(x, y);
	};

	const beginSettle = () => {
		settled = false;
		window.clearTimeout(settleTimer);
		settleTimer = window.setTimeout(() => {
			settled = true;
		}, SETTLE_MS);
	};

	const handlePointerDown = (event: PointerEvent) => {
		if (completed || !ctx || !canvasEl) return;
		event.preventDefault();
		drawing = true;
		settled = false;
		lastRecorded = null;
		window.clearTimeout(settleTimer);
		canvasEl.setPointerCapture(event.pointerId);
		const { x, y } = pointerPos(event);
		ctx.beginPath();
		ctx.moveTo(x, y);
		paintStroke(x, y);
	};

	const handlePointerMove = (event: PointerEvent) => {
		if (!drawing || completed) return;
		event.preventDefault();
		const { x, y } = pointerPos(event);
		paintStroke(x, y);
	};

	const handlePointerUp = (event: PointerEvent) => {
		if (drawing) beginSettle();
		drawing = false;
		if (canvasEl?.hasPointerCapture(event.pointerId)) {
			canvasEl.releasePointerCapture(event.pointerId);
		}
		if (ctx) ctx.beginPath();
	};

	const handleThumbsDown = () => {
		if (completed) return;
		rebuildGuide();
	};

	const finishTrace = () => {
		if (!isReady || completed) return;
		completed = true;

		const guidePoints: TraceGuidePoint[] = samples.map(({ x, y, strokeIndex, t }) => ({
			x,
			y,
			strokeIndex,
			t
		}));
		scoreResult = scoreTracePath(drawPoints, guidePoints, hitRadius);
		feedback = scoreResult.label;
		speakText(scoreResult.label);

		window.clearTimeout(solveTimer);
		solveTimer = window.setTimeout(() => dispatch('solved'), 4500);
	};

	const handleThumbsUpPointerDown = (event: PointerEvent) => {
		if (!isReady || completed) return;
		donePointerId = event.pointerId;
	};

	const handleThumbsUpPointerUp = (event: PointerEvent) => {
		if (donePointerId !== event.pointerId) return;
		donePointerId = null;
		event.preventDefault();
		event.stopPropagation();
		finishTrace();
	};

	const handleThumbsUpPointerCancel = () => {
		donePointerId = null;
	};

	const handleThumbsUpClick = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const handleThumbsUpKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		finishTrace();
	};

	const handleThumbsDownKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		handleThumbsDown();
	};

	let resizeObserver: ResizeObserver | undefined;
	let resizeTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		rebuildGuide();
		if (wrapEl) {
			resizeObserver = new ResizeObserver(() => {
				if (drawing || completed) return;
				window.clearTimeout(resizeTimer);
				resizeTimer = window.setTimeout(() => rebuildGuide(), 150);
			});
			resizeObserver.observe(wrapEl);
		}
	});

	onDestroy(() => {
		window.clearTimeout(solveTimer);
		window.clearTimeout(settleTimer);
		window.clearTimeout(resizeTimer);
		resizeObserver?.disconnect();
		measureSvg?.remove();
	});

	let lastText = '';
	$: if (text && text !== lastText && canvasEl) {
		lastText = text;
		rebuildGuide();
	}
</script>

<div class="flex flex-col gap-4">
	<div class="rounded-2xl border border-brand-100 bg-brand-50/40 px-3 py-4 text-center">
		<p class="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Watch how to write it</p>
		<div class="mt-3 min-h-[5rem]">
			{#key text}
				<LetterStrokeGuide {text} />
			{/key}
		</div>
	</div>

	<p class="text-center text-sm text-stone-600">Now trace it yourself</p>

	<div
		bind:this={wrapEl}
		class="min-h-[22rem] overflow-hidden rounded-3xl border-2 border-stone-200 bg-stone-50 shadow-inner touch-none sm:min-h-[26rem]"
	>
		<canvas
			bind:this={canvasEl}
			class="block w-full cursor-crosshair"
			aria-label={prompt || 'Trace the letters'}
			on:pointerdown={handlePointerDown}
			on:pointermove={handlePointerMove}
			on:pointerup={handlePointerUp}
			on:pointercancel={handlePointerUp}
		></canvas>
	</div>

	<div class="space-y-2">
		<div class="flex items-center justify-between gap-2 text-xs font-medium text-stone-500">
			<span>Progress</span>
			<span>{Math.round(progress * 100)}%</span>
		</div>
		<div class="h-2 overflow-hidden rounded-full bg-stone-200">
			<div
				class="h-full rounded-full bg-brand-600 transition-all duration-200"
				style={`width: ${Math.min(100, Math.round(progress * 100))}%`}
			></div>
		</div>
		{#if encourageMessage && !completed}
			<p
				class="text-center text-base font-semibold text-brand-800 transition-opacity"
				aria-live="polite"
			>
				{encourageMessage}
			</p>
		{/if}
	</div>

	<div class="flex items-center justify-center gap-8">
		<button
			type="button"
			class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-stone-200 bg-white text-3xl shadow-sm transition hover:border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:cursor-not-allowed disabled:opacity-40"
			disabled={completed}
			tabindex="0"
			aria-label="Try again"
			on:click={handleThumbsDown}
			on:keydown={handleThumbsDownKeyDown}
		>
			<span aria-hidden="true">👎</span>
		</button>
		<button
			type="button"
			class="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-3xl text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-40"
			disabled={!isReady}
			tabindex="0"
			aria-label="All done"
			on:pointerdown={handleThumbsUpPointerDown}
			on:pointerup={handleThumbsUpPointerUp}
			on:pointercancel={handleThumbsUpPointerCancel}
			on:click={handleThumbsUpClick}
			on:keydown={handleThumbsUpKeyDown}
		>
			<span aria-hidden="true">👍</span>
		</button>
	</div>

	{#if progress >= READY_RATIO && !settled && !completed}
		<p class="text-center text-sm text-stone-500">Lift your finger, then tap the thumbs up</p>
	{:else if isReady && !completed}
		<p class="text-center text-sm font-medium text-brand-800">Looking good — tap the thumbs up when you finish</p>
	{/if}

	{#if scoreResult}
		<div
			class="rounded-2xl bg-brand-50 px-4 py-4 text-center"
			aria-live="polite"
			aria-label={`${scoreResult.stars} out of 3 stars. ${scoreResult.label}`}
		>
			<p class="text-2xl tracking-wide text-amber-500" aria-hidden="true">
				{#each [1, 2, 3] as star}
					<span class:opacity-25={star > scoreResult.stars}>★</span>
				{/each}
			</p>
			<p class="mt-2 text-sm font-semibold text-brand-900">{scoreResult.label}</p>
			<p class="mt-1 text-xs text-stone-500">
				Path {Math.round(scoreResult.accuracy * 100)}% · Direction {Math.round(
					scoreResult.direction * 100
				)}% · Order {Math.round(scoreResult.order * 100)}%
			</p>
		</div>
	{:else if feedback}
		<p
			class="rounded-2xl bg-brand-50 px-4 py-3 text-center text-sm font-semibold text-brand-900"
			aria-live="polite"
		>
			{feedback}
		</p>
	{/if}
</div>
