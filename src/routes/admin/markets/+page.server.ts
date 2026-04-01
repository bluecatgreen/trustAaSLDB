import { db } from '$lib/server/db';
import { market } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/demo/better-auth');
	}

	// Check if user is admin
	if (!locals.user.isAdmin) {
		console.warn(`Unauthorized access attempt to admin markets page by user ID: ${locals.user.id}`);
		throw redirect(302, '/');
	}

	// Fetch all markets
	const markets = await db
		.select({
			id: market.id,
			name: market.name,
			country: market.country,
			countryCode: market.countryCode,
			state: market.state,
			city: market.city,
			suburb: market.suburb,
			neighbourhood: market.neighbourhood,
			road: market.road,
			postcode: market.postcode,
			houseNumber: market.houseNumber,
			displayName: market.displayName,
			lat: market.lat,
			lon: market.lon,
			uniqueFields: market.uniqueFields,
			createdAt: market.createdAt
		})
		.from(market)
		.orderBy(market.createdAt);

	return { user: locals.user, markets };
};

export const actions = {
	geocode: async ({ request }) => {
		const formData = await request.formData();
		const address = formData.get('address') as string;

		if (!address || address.trim().length === 0) {
			return { success: false, error: 'Address is required' };
		}

		try {
			const encodedAddress = encodeURIComponent(address.trim());
			const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodedAddress}`;

			const response = await fetch(nominatimUrl, {
				headers: {
					'User-Agent': 'TrustAaSLDB/1.0 (Contact: admin@trustaasldb.com)'
				}
			});

			if (!response.ok) {
				return { success: false, error: 'Failed to validate address' };
			}

			const results = await response.json();

			if (!results || results.length === 0) {
				return { success: false, error: 'Address not found. Please try a more specific address.' };
			}

			const result = results[0];
			const addressDetails = result.address;

			// Extract address components
			const validatedAddress = {
				displayName: result.display_name,
				street: addressDetails.road || addressDetails.street || '',
				houseNumber: addressDetails.house_number || addressDetails.housename || '',
				city: addressDetails.city || addressDetails.town || addressDetails.village || addressDetails.municipality || '',
				state: addressDetails.state || '',
				postalCode: addressDetails.postcode || '',
				country: addressDetails.country || '',
				countryCode: addressDetails.country_code || '',
				suburb: addressDetails.suburb || addressDetails.neighbourhood || '',
				neighbourhood: addressDetails.neighbourhood || '',
				lat: result.lat,
				lon: result.lon
			};

			return { success: true, address: validatedAddress };
		} catch (error) {
			console.error('Address validation error:', error);
			return { success: false, error: 'Failed to validate address. Please try again.' };
		}
	},

	createMarket: async ({ request, locals }) => {
		if (!locals.user || !locals.user.isAdmin) {
			return { success: false, error: 'Unauthorized' };
		}

		const formData = await request.formData();

		// Get selected unique fields
		const uniqueFieldsList = formData.get('uniqueFields') as string;
		const uniqueFields = uniqueFieldsList ? JSON.parse(uniqueFieldsList) : [];

		// Get address components
		const country = formData.get('country') as string || null;
		const countryCode = formData.get('countryCode') as string || null;
		const state = formData.get('state') as string || null;
		const city = formData.get('city') as string || null;
		const suburb = formData.get('suburb') as string || null;
		const neighbourhood = formData.get('neighbourhood') as string || null;
		const road = formData.get('road') as string || null;
		const houseNumber = formData.get('houseNumber') as string || null;
		const postcode = formData.get('postcode') as string || null;
		const lat = formData.get('lat') as string || null;
		const lon = formData.get('lon') as string || null;
		const displayName = formData.get('displayName') as string || null;

		// Generate a name from the selected unique fields
		const nameParts = [];
		if (uniqueFields.includes('city') && city) nameParts.push(city);
		else if (uniqueFields.includes('suburb') && suburb) nameParts.push(suburb);
		else if (uniqueFields.includes('neighbourhood') && neighbourhood) nameParts.push(neighbourhood);

		if (uniqueFields.includes('state') && state) nameParts.push(state);
		if (uniqueFields.includes('country') && country) nameParts.push(country);

		const name = nameParts.length > 0 ? nameParts.join(', ') : displayName?.split(',')[0] || 'Unnamed Market';

		try {
			await db.insert(market).values({
				name,
				country,
				countryCode,
				state,
				city,
				suburb,
				neighbourhood,
				road,
				houseNumber,
				postcode,
				displayName,
				lat,
				lon,
				uniqueFields: JSON.stringify(uniqueFields),
				creatorId: locals.user.id
			});

			return { success: true, message: 'Market created successfully' };
		} catch (error) {
			console.error('Failed to create market:', error);
			return { success: false, error: 'Failed to create market. It may already exist.' };
		}
	}
};