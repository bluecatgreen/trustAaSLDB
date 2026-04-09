import { redirect } from '@sveltejs/kit';
import { getUserListings } from '$lib/server/ai/listing-agent';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/demo/better-auth');
	}

	const listings = await getUserListings(locals.user.id);

	return {
		user: locals.user,
		listings
	};
};