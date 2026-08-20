import type { FamilyClue } from '$lib/types/clues';
import { getHuntByCode, type PlayHunt } from '$lib/data/sampleHunts';

const STORAGE_PREFIX = 'treasure-preview:';
const BUILDER_PREFIX = 'treasure-builder:';
const CODE_PREFIX = 'DRAFT-';

export type BuilderDraft = {
	savedClues: FamilyClue[];
	editingIndex: number | null;
	draft: FamilyClue;
};

export const previewCodeForHuntId = (huntId: string): string =>
	`${CODE_PREFIX}${huntId}`;

export const isPreviewCode = (code: string): boolean =>
	code.toUpperCase().startsWith(CODE_PREFIX);

export const huntIdFromPreviewCode = (code: string): string | null => {
	if (!isPreviewCode(code)) return null;
	return code.slice(CODE_PREFIX.length) || null;
};

export const buildPreviewHunt = (
	huntId: string,
	clues: FamilyClue[],
	title = 'Your hunt'
): PlayHunt => ({
	id: huntId,
	code: previewCodeForHuntId(huntId),
	title,
	setting: 'Preview',
	ageBand: '3-5',
	clues: clues.map((clue, index) => ({
		...clue,
		n: index + 1,
		puzzle: { ...clue.puzzle },
		traceMode: clue.traceMode ?? ''
	}))
});

export const savePreviewHunt = (hunt: PlayHunt): void => {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(`${STORAGE_PREFIX}${hunt.code.toUpperCase()}`, JSON.stringify(hunt));
};

export const loadPreviewHunt = (code: string): PlayHunt | undefined => {
	if (typeof sessionStorage === 'undefined') return undefined;
	const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${code.toUpperCase()}`);
	if (!raw) return undefined;
	try {
		const parsed = JSON.parse(raw) as PlayHunt;
		if (!parsed?.clues?.length) return undefined;
		return parsed;
	} catch {
		return undefined;
	}
};

/** Sample hunts first; draft previews from sessionStorage on the client. */
export const resolvePlayHunt = (code: string): PlayHunt | undefined =>
	getHuntByCode(code) ?? loadPreviewHunt(code);

export const saveBuilderDraft = (huntId: string, state: BuilderDraft): void => {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(`${BUILDER_PREFIX}${huntId}`, JSON.stringify(state));
};

export const loadBuilderDraft = (huntId: string): BuilderDraft | undefined => {
	if (typeof sessionStorage === 'undefined') return undefined;
	const raw = sessionStorage.getItem(`${BUILDER_PREFIX}${huntId}`);
	if (!raw) return undefined;
	try {
		const parsed = JSON.parse(raw) as BuilderDraft;
		if (!Array.isArray(parsed?.savedClues) || !parsed.draft) return undefined;
		return parsed;
	} catch {
		return undefined;
	}
};
