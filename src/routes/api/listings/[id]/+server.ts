import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getListingById, updateListing, deleteListing } from '$lib/server/ai/listing-agent';

export const GET: RequestHandler = async ({ params, locals }) => {
	const currentUser = locals.user;

	if (!currentUser) {
		return json({ listing: null, error: 'Not authenticated' }, { status: 401 });
	}

	try {
		const listing = await getListingById(params.id, currentUser.id);
		if (!listing) {
			return json({ listing: null, error: 'Listing not found' }, { status: 404 });
		}
		return json({ listing });
	} catch (error) {
		console.error('Error fetching listing:', error);
		return json({ listing: null, error: String(error) }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const currentUser = locals.user;

	if (!currentUser) {
		return json({ success: false, error: 'Not authenticated' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { title, description, category, amount, currency, locationName, locationAddress, listingStartDate, listingEndDate, status } = body;

		const updateData: Record<string, unknown> = {};
		if (title !== undefined) updateData.title = title;
		if (description !== undefined) updateData.description = description;
		if (category !== undefined) updateData.category = category;
		if (amount !== undefined) updateData.amount = amount;
		if (currency !== undefined) updateData.currency = currency;
		if (locationName !== undefined) updateData.locationName = locationName;
		if (locationAddress !== undefined) updateData.locationAddress = locationAddress;
		if (listingStartDate !== undefined) updateData.listingStartDate = listingStartDate ? new Date(listingStartDate) : undefined;
		if (listingEndDate !== undefined) updateData.listingEndDate = listingEndDate ? new Date(listingEndDate) : undefined;
		if (status !== undefined) updateData.status = status;

		const success = await updateListing(params.id, currentUser.id, updateData);
		return json({ success });
	} catch (error) {
		console.error('Error updating listing:', error);
		return json({ success: false, error: String(error) }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const currentUser = locals.user;

	if (!currentUser) {
		return json({ success: false, error: 'Not authenticated' }, { status: 401 });
	}

	try {
		const success = await deleteListing(params.id, currentUser.id);
		return json({ success });
	} catch (error) {
		console.error('Error deleting listing:', error);
		return json({ success: false, error: String(error) }, { status: 500 });
	}
};