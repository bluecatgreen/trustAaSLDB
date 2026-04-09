import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserListings, createListing } from '$lib/server/ai/listing-agent';

export const GET: RequestHandler = async ({ locals }) => {
	const currentUser = locals.user;

	if (!currentUser) {
		return json({ listings: [], error: 'Not authenticated' }, { status: 401 });
	}

	try {
		const listings = await getUserListings(currentUser.id);
		return json({ listings });
	} catch (error) {
		console.error('Error fetching listings:', error);
		return json({ listings: [], error: String(error) }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const currentUser = locals.user;

	if (!currentUser) {
		return json({ success: false, error: 'Not authenticated' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { title, description, category, amount, currency, locationName, locationAddress, listingStartDate, listingEndDate } = body;

		if (!title) {
			return json({ success: false, error: 'Title is required' }, { status: 400 });
		}

		const listingData = {
			title,
			description,
			category,
			amount,
			currency: currency || 'USD',
			locationName,
			locationAddress,
			listingStartDate: listingStartDate ? new Date(listingStartDate) : undefined,
			listingEndDate: listingEndDate ? new Date(listingEndDate) : undefined
		};

		const id = await createListing(currentUser.id, listingData);
		return json({ success: true, id });
	} catch (error) {
		console.error('Error creating listing:', error);
		return json({ success: false, error: String(error) }, { status: 500 });
	}
};