import { getHuntByPlayCode } from '$lib/supabase/hunts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
	const hunt = await getHuntByPlayCode(params.code ?? '');
	return {
		hunt,
		preview: url.searchParams.get('preview') === '1'
	};
};
