import { browser } from '$app/environment';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database';

/**
 * Node 20 (Vercel) has no native WebSocket; Supabase Realtime needs one at init.
 * Polyfill only on the server — browsers already have WebSocket.
 */
if (!browser && typeof WebSocket === 'undefined') {
	const { WebSocket: NodeWebSocket } = await import('ws');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(globalThis as any).WebSocket = NodeWebSocket;
}

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: {
		persistSession: browser,
		autoRefreshToken: browser,
		detectSessionInUrl: browser
	}
});
