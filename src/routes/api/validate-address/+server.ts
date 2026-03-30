import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const address = body.address as string;

	if (!address || address.trim().length === 0) {
		return json({ success: false, error: 'Address is required' }, { status: 400 });
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
			return json({ success: false, error: 'Failed to validate address' }, { status: response.status });
		}

		const results = await response.json();

		if (!results || results.length === 0) {
			return json({ success: false, error: 'Address not found. Please try a more specific address.' }, { status: 404 });
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
			lat: result.lat,
			lon: result.lon
		};

		return json({ success: true, address: validatedAddress });
	} catch (error) {
		console.error('Address validation error:', error);
		return json({ success: false, error: 'Failed to validate address. Please try again.' }, { status: 500 });
	}
};