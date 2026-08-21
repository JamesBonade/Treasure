import type { FamilyClue } from '$lib/types/clues';
import type { BuilderDraft, HuntMeta, HuntStatus, PlayHunt } from '$lib/types/hunts';

export type { BuilderDraft, HuntMeta, HuntStatus, PlayHunt };

const BUILDER_PREFIX = 'treasure-builder:';
/** Easy-to-read characters (no 0/O/1/I). */
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PLAY_CODE_LENGTH = 4;

export const defaultHuntMeta = (): HuntMeta => ({
	title: '',
	ageBand: '3-5',
	setting: '',
	status: 'draft',
	playCode: ''
});

export const createPlayCode = (): string => {
	let code = '';
	for (let i = 0; i < PLAY_CODE_LENGTH; i += 1) {
		code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
	}
	return code;
};

export const ensurePlayCode = (meta: HuntMeta): HuntMeta => {
	const existing = meta.playCode?.trim().toUpperCase();
	if (existing) return { ...meta, playCode: existing };
	return { ...meta, playCode: createPlayCode() };
};

export const buildPreviewHunt = (
	huntId: string,
	clues: FamilyClue[],
	meta: Partial<HuntMeta> = {}
): PlayHunt => {
	const withCode = ensurePlayCode({ ...defaultHuntMeta(), ...meta });
	return {
		id: huntId,
		code: withCode.playCode,
		title: withCode.title.trim() || 'Your hunt',
		setting: withCode.setting.trim() || 'Home',
		ageBand: withCode.ageBand,
		clues: clues.map((clue, index) => ({
			...clue,
			n: index + 1,
			puzzle: { ...clue.puzzle },
			traceMode: clue.traceMode ?? ''
		}))
	};
};

export const loadBuilderDraft = (huntId: string): BuilderDraft | undefined => {
	if (typeof sessionStorage === 'undefined') return undefined;
	const raw = sessionStorage.getItem(`${BUILDER_PREFIX}${huntId}`);
	if (!raw) return undefined;
	try {
		const parsed = JSON.parse(raw) as BuilderDraft;
		if (!Array.isArray(parsed?.savedClues) || !parsed.draft) return undefined;
		return {
			...parsed,
			meta: {
				...defaultHuntMeta(),
				...(parsed.meta ?? {})
			}
		};
	} catch {
		return undefined;
	}
};

export const createHuntId = (): string => crypto.randomUUID();

/** Return a new hunt id without writing until the parent taps Save. */
export const startNewHunt = (): string => createHuntId();

export const previewSuffix = (preview: boolean): string => (preview ? '?preview=1' : '');
