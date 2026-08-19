const getSpeechRecognition = (): SpeechRecognitionConstructor | undefined => {
	if (typeof window === 'undefined') return undefined;
	return window.SpeechRecognition ?? window.webkitSpeechRecognition;
};

export const canSpeak = (): boolean =>
	typeof window !== 'undefined' && 'speechSynthesis' in window;

export const canListen = (): boolean => Boolean(getSpeechRecognition());

export const speakText = (text: string): void => {
	if (!canSpeak() || !text.trim()) return;
	window.speechSynthesis.cancel();
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.rate = 0.92;
	utterance.pitch = 1.05;
	window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = (): void => {
	if (!canSpeak()) return;
	window.speechSynthesis.cancel();
};

type SpeechListener = {
	start: () => void;
	stop: () => void;
	isSupported: boolean;
};

export const createSpeechListener = (
	onResult: (transcript: string) => void,
	onError?: (message: string) => void
): SpeechListener => {
	const SpeechRecognitionClass = getSpeechRecognition();

	if (!SpeechRecognitionClass) {
		return { start: () => {}, stop: () => {}, isSupported: false };
	}

	const recognition = new SpeechRecognitionClass();
	recognition.lang = 'en-GB';
	recognition.interimResults = false;
	recognition.maxAlternatives = 1;

	recognition.onresult = (event: SpeechRecognitionEvent) => {
		const transcript = event.results[0]?.[0]?.transcript ?? '';
		if (transcript.trim()) onResult(transcript);
	};

	recognition.onerror = () => {
		onError?.('Could not hear that. Try again or tap an answer.');
	};

	return {
		isSupported: true,
		start: () => recognition.start(),
		stop: () => recognition.stop()
	};
};
