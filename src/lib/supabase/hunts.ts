import { supabase } from '$lib/supabase/client';
import { getOwnerKey } from '$lib/supabase/ownerKey';
import type { AgeBand, ClueType, FamilyClue, PuzzleModules, TraceMode } from '$lib/types/clues';
import { emptyPuzzleModules } from '$lib/types/clues';
import type { Json } from '$lib/types/database';
import type { HuntListItem, HuntMeta, HuntStatus, PlayHunt, StoredHunt } from '$lib/types/hunts';
import { createPlayCode, ensurePlayCode, loadBuilderDraft } from '$lib/utils/huntPreview';

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MIGRATED_KEY = 'treasure-migrated-to-supabase';

const isUuid = (value: string): boolean => UUID_PATTERN.test(value);
const BUILDER_PREFIX = 'treasure-builder:';

const isAgeBand = (value: unknown): value is AgeBand =>
	value === '3-5' || value === '5-8' || value === '8-12';

const isHuntStatus = (value: unknown): value is HuntStatus =>
	value === 'draft' || value === 'published';

const isClueType = (value: unknown): value is ClueType =>
	value === 'word' || value === 'puzzle' || value === 'trace';

const isTraceMode = (value: unknown): value is TraceMode =>
	value === 'letter' || value === 'word';

const asRecord = (value: unknown): Record<string, unknown> | null =>
	value !== null && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;

const parsePuzzle = (value: unknown): PuzzleModules => {
	const record = asRecord(value);
	if (!record) return emptyPuzzleModules();
	return {
		number: typeof record.number === 'string' ? record.number : null,
		object: typeof record.object === 'string' ? record.object : null,
		colour: typeof record.colour === 'string' ? record.colour : null,
		shape: typeof record.shape === 'string' ? record.shape : null
	};
};

const parseClue = (value: unknown, index: number): FamilyClue => {
	const record = asRecord(value) ?? {};
	const traceMode = record.traceMode ?? record.trace_mode;
	return {
		n: typeof record.n === 'number' ? record.n : index + 1,
		type: isClueType(record.type) ? record.type : 'word',
		action: typeof record.action === 'string' ? record.action : '',
		place: typeof record.place === 'string' ? record.place : '',
		discover: typeof record.discover === 'string' ? record.discover : '',
		answer: typeof record.answer === 'string' ? record.answer : '',
		puzzle: parsePuzzle(record.puzzle),
		traceMode: isTraceMode(traceMode) ? traceMode : ''
	};
};

const parseStoredHunt = (value: unknown): StoredHunt | null => {
	const record = asRecord(value);
	if (!record || typeof record.id !== 'string') return null;
	const clues = Array.isArray(record.clues) ? record.clues.map(parseClue) : [];
	return {
		id: record.id,
		code: typeof record.code === 'string' ? record.code : '',
		title: typeof record.title === 'string' ? record.title : '',
		setting: typeof record.setting === 'string' ? record.setting : '',
		ageBand: isAgeBand(record.ageBand) ? record.ageBand : '3-5',
		status: isHuntStatus(record.status) ? record.status : 'draft',
		clues
	};
};

const toPlayHunt = (hunt: StoredHunt): PlayHunt => ({
	id: hunt.id,
	code: hunt.code,
	title: hunt.title.trim() || 'Your hunt',
	setting: hunt.setting.trim() || 'Home',
	ageBand: hunt.ageBand,
	clues: hunt.clues
});

const parseListItem = (value: unknown): HuntListItem | null => {
	const record = asRecord(value);
	if (!record || typeof record.id !== 'string') return null;
	return {
		id: record.id,
		title: typeof record.title === 'string' && record.title.trim() ? record.title : 'Untitled hunt',
		setting: typeof record.setting === 'string' && record.setting.trim() ? record.setting : 'Not set',
		ageBand: isAgeBand(record.ageBand) ? record.ageBand : '3-5',
		status: isHuntStatus(record.status) ? record.status : 'draft',
		clueCount: typeof record.clueCount === 'number' ? record.clueCount : 0,
		playCode: typeof record.playCode === 'string' ? record.playCode : '····'
	};
};

const isUniquePlayCodeError = (message: string): boolean =>
	/duplicate key|unique|play_code/i.test(message);

const cluesToJson = (clues: FamilyClue[]): Json =>
	clues.map((clue, index) => ({
		n: index + 1,
		type: clue.type,
		action: clue.action,
		place: clue.place,
		discover: clue.discover,
		answer: clue.answer,
		puzzle: clue.puzzle,
		traceMode: clue.traceMode
	})) as Json;

export const getHuntByPlayCode = async (code: string): Promise<PlayHunt | null> => {
	const trimmed = code.trim();
	if (!trimmed) return null;
	const { data, error } = await supabase.rpc('get_hunt_by_play_code', { p_code: trimmed });
	if (error || data == null) return null;
	const hunt = parseStoredHunt(data);
	if (!hunt?.clues.length) return null;
	return toPlayHunt(hunt);
};

export const getMyHunt = async (huntId: string): Promise<StoredHunt | null> => {
	if (!isUuid(huntId)) return null;
	const { data, error } = await supabase.rpc('get_my_hunt', {
		p_owner_key: getOwnerKey(),
		p_id: huntId
	});
	if (error || data == null) return null;
	return parseStoredHunt(data);
};

export const listMyHunts = async (): Promise<HuntListItem[]> => {
	const { data, error } = await supabase.rpc('list_my_hunts', { p_owner_key: getOwnerKey() });
	if (error || data == null) return [];
	const rows = Array.isArray(data) ? data : [];
	return rows.map(parseListItem).filter((item): item is HuntListItem => Boolean(item));
};

export const saveHunt = async (
	huntId: string,
	meta: HuntMeta,
	clues: FamilyClue[]
): Promise<StoredHunt> => {
	if (!isUuid(huntId)) {
		throw new Error('Invalid hunt id');
	}
	let playCode = ensurePlayCode(meta).playCode;

	for (let attempt = 0; attempt < 6; attempt += 1) {
		const { data, error } = await supabase.rpc('upsert_hunt', {
			p_owner_key: getOwnerKey(),
			p_id: huntId,
			p_play_code: playCode,
			p_title: meta.title.trim(),
			p_setting: meta.setting.trim(),
			p_age_band: meta.ageBand,
			p_status: meta.status,
			p_clues: cluesToJson(clues)
		});

		if (!error) {
			const parsed = parseStoredHunt(data);
			if (parsed) return parsed;
			throw new Error('Could not save hunt');
		}

		if (isUniquePlayCodeError(error.message) && attempt < 5) {
			playCode = createPlayCode();
			continue;
		}

		throw new Error(error.message);
	}

	throw new Error('Could not save hunt');
};

export const huntToMeta = (hunt: StoredHunt): HuntMeta => ({
	title: hunt.title,
	ageBand: hunt.ageBand,
	setting: hunt.setting,
	status: hunt.status,
	playCode: hunt.code
});

/** One-time copy of sessionStorage drafts into Supabase. */
export const migrateLocalDrafts = async (): Promise<void> => {
	if (typeof sessionStorage === 'undefined' || typeof localStorage === 'undefined') return;
	if (localStorage.getItem(MIGRATED_KEY) === '1') return;

	const ids: string[] = [];
	for (let i = 0; i < sessionStorage.length; i += 1) {
		const key = sessionStorage.key(i);
		if (!key?.startsWith(BUILDER_PREFIX)) continue;
		const id = key.slice(BUILDER_PREFIX.length);
		if (id) ids.push(id);
	}

	for (const oldId of ids) {
		const draft = loadBuilderDraft(oldId);
		if (!draft || draft.savedClues.length === 0) continue;
		try {
			await saveHunt(crypto.randomUUID(), draft.meta, draft.savedClues);
		} catch {
			// Keep going so one bad draft does not block the rest.
		}
	}

	localStorage.setItem(MIGRATED_KEY, '1');
};
