<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { getAnswerBlocksForDiscover } from '$lib/data/answerBlocks';
	import { answersMatch } from '$lib/data/sampleHunts';
	import type { FamilyClue } from '$lib/types/clues';
	import { canListen, createSpeechListener, speakText } from '$lib/utils/speech';

	export let clue: FamilyClue;

	const dispatch = createEventDispatcher<{ solved: void }>();

	let typedAnswer = '';
	let feedback = '';
	let feedbackTone: 'neutral' | 'success' | 'error' = 'neutral';
	let isListening = false;
	let speechSupported = false;
	let showTyping = false;
	let solveTimer: ReturnType<typeof setTimeout> | undefined;
	let solved = false;

	let listener = createSpeechListener(
		(transcript) => {
			isListening = false;
			typedAnswer = transcript;
			handleSubmit(transcript);
		},
		(message) => {
			isListening = false;
			feedback = message;
			feedbackTone = 'error';
		}
	);

	$: options = getAnswerBlocksForDiscover(clue.discover).map((block) => block.text);
	$: uniqueOptions = [...new Set([...options, clue.answer].filter(Boolean))];

	onMount(() => {
		speechSupported = canListen();
	});

	onDestroy(() => {
		window.clearTimeout(solveTimer);
		listener.stop();
	});

	const setFeedback = (message: string, tone: 'neutral' | 'success' | 'error') => {
		feedback = message;
		feedbackTone = tone;
	};

	const handleSubmit = (value = typedAnswer) => {
		if (solved) return;
		if (!value.trim()) {
			setFeedback('Pick an answer or say it out loud.', 'error');
			return;
		}

		if (answersMatch(value, clue.answer)) {
			solved = true;
			setFeedback('Correct! Well done!', 'success');
			speakText('Correct! Well done!');
			window.clearTimeout(solveTimer);
			solveTimer = window.setTimeout(() => dispatch('solved'), 700);
			return;
		}

		setFeedback('Not quite — try again!', 'error');
		speakText('Not quite. Try again.');
	};

	const handlePick = (option: string) => {
		typedAnswer = option;
		handleSubmit(option);
	};

	const handleListen = () => {
		if (!speechSupported) {
			setFeedback('Voice answers are not supported in this browser.', 'error');
			return;
		}
		if (isListening) {
			listener.stop();
			isListening = false;
			return;
		}
		setFeedback('Listening… say your answer.', 'neutral');
		isListening = true;
		listener.start();
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') handleSubmit();
	};
</script>

<div class="flex flex-1 flex-col gap-5">
	<ul class="mx-auto grid w-full max-w-sm grid-cols-2 gap-3" role="list">
		{#each uniqueOptions as option (option)}
			<li>
				<button
					type="button"
					class="flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl border-2 px-4 py-3 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-200"
					class:border-brand-600={typedAnswer === option}
					class:bg-brand-600={typedAnswer === option}
					class:text-white={typedAnswer === option}
					class:shadow-md={typedAnswer === option}
					class:border-stone-200={typedAnswer !== option}
					class:bg-stone-50={typedAnswer !== option}
					class:text-stone-800={typedAnswer !== option}
					class:hover:border-brand-300={typedAnswer !== option}
					class:hover:bg-brand-50={typedAnswer !== option}
					aria-pressed={typedAnswer === option}
					on:click={() => handlePick(option)}
				>
					{option}
				</button>
			</li>
		{/each}
	</ul>

	<div class="mt-auto flex flex-col items-center gap-3">
		{#if speechSupported}
			<button
				type="button"
				class="inline-flex min-h-[3.5rem] w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-6 text-base font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-200 sm:w-auto"
				class:bg-brand-700={!isListening}
				class:text-white={!isListening}
				class:hover:bg-brand-800={!isListening}
				class:border-2={isListening}
				class:border-brand-500={isListening}
				class:bg-brand-50={isListening}
				class:text-brand-900={isListening}
				aria-pressed={isListening}
				aria-label={isListening ? 'Stop listening' : 'Say your answer out loud'}
				on:click={handleListen}
			>
				<span aria-hidden="true">{isListening ? '🎙️' : '🎤'}</span>
				{isListening ? 'Listening…' : 'Say answer'}
			</button>
		{/if}

		<button
			type="button"
			class="text-xs font-medium text-stone-500 underline-offset-2 hover:text-stone-700 hover:underline"
			on:click={() => (showTyping = !showTyping)}
		>
			{showTyping ? 'Hide typing' : 'Type instead'}
		</button>

		{#if showTyping}
			<div class="flex w-full max-w-md flex-col gap-2 sm:flex-row">
				<input
					type="text"
					class="field-input flex-1 text-base"
					placeholder="Type your answer…"
					aria-label="Type your answer"
					bind:value={typedAnswer}
					on:keydown={handleKeyDown}
				/>
				<button type="button" class="btn-primary whitespace-nowrap" on:click={() => handleSubmit()}>
					Check
				</button>
			</div>
		{/if}
	</div>

	{#if feedback}
		<p
			class="rounded-2xl px-4 py-3 text-center text-sm font-semibold"
			class:bg-brand-50={feedbackTone === 'success'}
			class:text-brand-900={feedbackTone === 'success'}
			class:bg-red-50={feedbackTone === 'error'}
			class:text-red-800={feedbackTone === 'error'}
			class:bg-stone-100={feedbackTone === 'neutral'}
			class:text-stone-700={feedbackTone === 'neutral'}
			aria-live="polite"
		>
			{feedback}
		</p>
	{/if}
</div>
