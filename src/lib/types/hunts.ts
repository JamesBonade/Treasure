import type { AgeBand, FamilyClue } from '$lib/types/clues';

export type HuntStatus = 'draft' | 'published';

export type HuntMeta = {
	title: string;
	ageBand: AgeBand;
	setting: string;
	status: HuntStatus;
	/** Short join code for play, e.g. K7MP */
	playCode: string;
};

export type PlayHunt = {
	id: string;
	code: string;
	title: string;
	setting: string;
	ageBand: AgeBand;
	clues: FamilyClue[];
};

export type StoredHunt = PlayHunt & {
	status: HuntStatus;
};

export type HuntListItem = {
	id: string;
	title: string;
	setting: string;
	ageBand: AgeBand;
	status: HuntStatus;
	clueCount: number;
	playCode: string;
};

export type BuilderDraft = {
	meta: HuntMeta;
	savedClues: FamilyClue[];
	editingIndex: number | null;
	draft: FamilyClue;
};
