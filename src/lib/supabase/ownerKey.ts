const OWNER_KEY_STORAGE = 'treasure-owner-key';

/** Stable per-browser key used to load and save this device's hunts. */
export const getOwnerKey = (): string => {
	if (typeof localStorage === 'undefined') {
		throw new Error('Owner key is only available in the browser');
	}

	const existing = localStorage.getItem(OWNER_KEY_STORAGE);
	if (existing) return existing;

	const next = crypto.randomUUID();
	localStorage.setItem(OWNER_KEY_STORAGE, next);
	return next;
};
