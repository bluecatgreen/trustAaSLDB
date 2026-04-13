import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { listing, user } from '$lib/server/db/schema';
import { eq, desc, like } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/demo/better-auth');
	}

	const searchQuery = url.searchParams.get('q') || '';
	const searchBy = url.searchParams.get('by') || 'email';
	const searchName = url.searchParams.get('name') || '';

	// Helper to flatten joined results
	const flattenResults = (results: any[]) => {
		return results.map((row) => ({
			...row.listing,
			creatorName: row.user?.name ?? null,
			creatorEmail: row.user?.email ?? null
		}));
	};

	let listingsData;
	let latestListings;

	// Get the 6 latest listings
	const latestResults = await db
		.select()
		.from(listing)
		.leftJoin(user, eq(listing.userId, user.id))
		.orderBy(desc(listing.createdAt))
		.limit(6);

	latestListings = flattenResults(latestResults);

	// If there's a search query, filter by user/email
	if (searchQuery) {
		if (searchBy === 'user') {
			// Search by user ID (selected from autocomplete)
			const searchResults = await db
				.select()
				.from(listing)
				.leftJoin(user, eq(listing.userId, user.id))
				.where(eq(listing.userId, searchQuery))
				.orderBy(desc(listing.createdAt));
			listingsData = flattenResults(searchResults);
		} else if (searchBy === 'email') {
			// Search by email (use like + lower for case-insensitive in SQLite)
			const searchResults = await db
				.select()
				.from(listing)
				.leftJoin(user, eq(listing.userId, user.id))
				.where(like(user.email, `%${searchQuery}%`))
				.orderBy(desc(listing.createdAt));
			listingsData = flattenResults(searchResults);
		} else {
			// Search by user name (use like + lower for case-insensitive in SQLite)
			const searchResults = await db
				.select()
				.from(listing)
				.leftJoin(user, eq(listing.userId, user.id))
				.where(like(user.name, `%${searchQuery}%`))
				.orderBy(desc(listing.createdAt));
			listingsData = flattenResults(searchResults);
		}
	}

	return {
		latestListings,
		searchResults: listingsData ?? [],
		searchQuery,
		searchBy,
		searchName
	};
};