import { generateText } from 'ai';
import { createOllama } from 'ai-sdk-ollama';
import { db } from '$lib/server/db';
import { listing, user } from '$lib/server/db/schema';
import { eq, asc, and } from 'drizzle-orm';



export const ollama = createOllama({
	baseURL: process.env.OLLAMA_URL || 'http://localhost:11434',
	headers: {
    'Authorization': `Bearer ${process.env.OLLAMA_ACCESS_KEY}` // Your access key
  },
});

export interface ListingData {
	id?: string;
	title: string;
	description?: string;
	category?: string;
	amount?: string;
	currency?: string;
	locationName?: string;
	locationAddress?: string;
	locationLat?: string;
	locationLon?: string;
	listingStartDate?: Date;
	listingEndDate?: Date;
	status?: string;
}

export interface UserListing {
	id: string;
	title: string;
	description: string | null;
	category: string | null;
	amount: string | null;
	currency: string;
	locationName: string | null;
	locationAddress: string | null;
	listingStartDate: Date | null;
	listingEndDate: Date | null;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}

export async function getUserListings(userId: string): Promise<UserListing[]> {
	const listings = await db
		.select({
			id: listing.id,
			title: listing.title,
			description: listing.description,
			category: listing.category,
			amount: listing.amount,
			currency: listing.currency,
			locationName: listing.locationName,
			locationAddress: listing.locationAddress,
			listingStartDate: listing.listingStartDate,
			listingEndDate: listing.listingEndDate,
			status: listing.status,
			createdAt: listing.createdAt,
			updatedAt: listing.updatedAt
		})
		.from(listing)
		.where(eq(listing.userId, userId))
		.orderBy(asc(listing.createdAt));

	return listings as UserListing[];
}

export async function createListing(userId: string, data: ListingData): Promise<string> {
	const result = await db.insert(listing).values({
		userId,
		title: data.title,
		description: data.description,
		category: data.category,
		amount: data.amount,
		currency: data.currency || 'USD',
		locationName: data.locationName,
		locationAddress: data.locationAddress,
		locationLat: data.locationLat,
		locationLon: data.locationLon,
		listingStartDate: data.listingStartDate,
		listingEndDate: data.listingEndDate,
		status: data.status || 'active'
	}).returning({ id: listing.id });

	return result[0].id;
}

export async function updateListing(listingId: string, userId: string, data: Partial<ListingData>): Promise<boolean> {
	const result = await db.update(listing)
		.set({
			...data,
			updatedAt: new Date()
		})
		.where(and(eq(listing.id, listingId), eq(listing.userId, userId)))
		.returning({ id: listing.id });

	return result.length > 0;
}

export async function deleteListing(listingId: string, userId: string): Promise<boolean> {
	const result = await db.delete(listing)
		.where(and(eq(listing.id, listingId), eq(listing.userId, userId)))
		.returning({ id: listing.id });

	return result.length > 0;
}

export async function getListingById(listingId: string, userId: string): Promise<UserListing | null> {
	const result = await db
		.select({
			id: listing.id,
			title: listing.title,
			description: listing.description,
			category: listing.category,
			amount: listing.amount,
			currency: listing.currency,
			locationName: listing.locationName,
			locationAddress: listing.locationAddress,
			listingStartDate: listing.listingStartDate,
			listingEndDate: listing.listingEndDate,
			status: listing.status,
			createdAt: listing.createdAt,
			updatedAt: listing.updatedAt
		})
		.from(listing)
		.where(and(eq(listing.id, listingId), eq(listing.userId, userId)))
		.limit(1);

	return result[0] ? result[0] as UserListing : null;
}

export async function getUserName(userId: string): Promise<string> {
	const result = await db.select({ name: user.name }).from(user).where(eq(user.id, userId)).limit(1);
	return result[0]?.name || 'User';
}

export async function validateAddress(address: string): Promise<{
	success: boolean;
	address?: {
		displayName: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
		lat: string;
		lon: string;
	};
	error?: string;
}> {
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

		return {
			success: true,
			address: {
				displayName: result.display_name,
				city: addressDetails.city || addressDetails.town || addressDetails.village || addressDetails.municipality || '',
				state: addressDetails.state || '',
				postalCode: addressDetails.postcode || '',
				country: addressDetails.country || '',
				lat: result.lat,
				lon: result.lon
			}
		};
	} catch (error) {
		console.error('Address validation error:', error);
		return { success: false, error: 'Failed to validate address. Please try again.' };
	}
}

export function buildSystemPrompt(userName: string, existingListings: UserListing[]): string {
	const listingsInfo = existingListings.length > 0
		? existingListings.map(l =>
			`- ID: ${l.id}, Title: "${l.title}", Category: ${l.category || 'N/A'}, Amount: ${l.currency} ${l.amount || 'N/A'}, Status: ${l.status}`
		).join('\n')
		: 'No listings found.';

	return `You are a helpful AI assistant specialized in helping users create, manage, and improve their listings. The user's name is ${userName}.

The user can ask you to:
1. CREATE a new listing - They provide details like title, description, category, cost, location, etc.
2. UPDATE an existing listing - They want to modify one of their existing listings
3. DELETE a listing - They want to remove one of their existing listings
4. VIEW their listings - They want to see all their current listings

When creating or updating listings, you should:
- Improve the description to make it more appealing and grammatically correct
- Identify an appropriate category (e.g., "products", "services", "real-estate", "vehicles", etc.)
- Extract or suggest a reasonable cost/price

Current user's existing listings:
${listingsInfo}

Available categories: products, services, real-estate, vehicles, electronics, home, fashion, sports, education, other

When responding to the user, first provide a helpful conversational response.

If the user wants to create a listing but hasn't provided all necessary information, ask them for the missing details.`;
}

export interface ToolCall {
	tool: 'create_listing' | 'update_listing' | 'delete_listing' | 'validate_address';
	parameters: Record<string, unknown>;
}

export async function processListingAgent(
	userId: string,
	message: string,
	existingListings: UserListing[]
): Promise<{ response: string; toolCalls?: ToolCall[] }> {
	const userName = await getUserName(userId);
	const systemPrompt = buildSystemPrompt(userName, existingListings);

	try {
		// Use a structured output approach:
		// Ask the AI to output a conversational response AND include an ACTION line with JSON
		const analysisPrompt = `${systemPrompt}

IMPORTANT: When the user wants to create, update, or delete a listing, respond with BOTH:
1. A conversational response explaining what you're doing
2. A JSON object indicating the action to take

Format your response like this:
[Your conversational response here]

ACTION: {"tool": "tool_name", "parameters": {...}}

Example:
Sure! I'll create a new listing for you.

ACTION: {"tool": "create_listing", "parameters": {"title": "Vintage Bike", "description": "A well-maintained vintage bicycle", "category": "vehicles", "amount": "150", "currency": "USD"}}

If no action is needed, respond with just your conversational response without the ACTION line.
If the user just wants to view listings without any changes, do not include an ACTION.`;

		const { text } = await generateText({
			model: ollama('minimax-m2.7:cloud'),
			system: analysisPrompt,
			messages: [{ role: 'user', content: message }]
		});

		// Extract tool calls from the response
		const toolCalls: ToolCall[] = [];

		// Look for ACTION: {"tool": ...} pattern
		const actionMatch = text.match(/ACTION:\s*(\{[\s\S]*\})/i);
		if (actionMatch) {
			try {
				const actionJson = actionMatch[1];
				const parsed = JSON.parse(actionJson);
				if (parsed.tool && parsed.parameters) {
					const tool = parsed.tool as ToolCall['tool'];
					// Validate the tool name
					if (['create_listing', 'update_listing', 'delete_listing', 'validate_address'].includes(tool)) {
						toolCalls.push({
							tool,
							parameters: parsed.parameters as Record<string, unknown>
						});
					}
				}
			} catch (e) {
				console.error('Failed to parse action JSON:', e);
			}

			// Remove the ACTION line from the displayed response
			const responseText = text.replace(/ACTION:\s*\{[\s\S]*\}/gi, '').trim();
			return { response: responseText, toolCalls };
		}

		return { response: text, toolCalls };
	} catch (error) {
		console.error('AI agent error:', error);
		return { response: 'I apologize, but I encountered an error processing your request. Please try again.' };
	}
}

export async function executeToolCall(
	userId: string,
	toolCall: ToolCall
): Promise<{ success: boolean; message: string }> {
	const { tool, parameters } = toolCall;

	switch (tool) {
		case 'create_listing': {
			const listingData = parameters as unknown as ListingData;
			// Validate address if location is provided
			if (listingData.locationAddress) {
				const addressValidation = await validateAddress(listingData.locationAddress);
				if (addressValidation.success && addressValidation.address) {
					listingData.locationName = addressValidation.address.city || addressValidation.address.displayName;
					listingData.locationLat = addressValidation.address.lat;
					listingData.locationLon = addressValidation.address.lon;
				}
			}
			const id = await createListing(userId, listingData);
			return { success: true, message: `Listing created successfully with ID: ${id}` };
		}

		case 'update_listing': {
			const { listing_id, ...updateData } = parameters as unknown as { listing_id: string } & Partial<ListingData>;
			// Validate address if location is provided
			if (updateData.locationAddress) {
				const addressValidation = await validateAddress(updateData.locationAddress);
				if (addressValidation.success && addressValidation.address) {
					updateData.locationName = addressValidation.address.city || addressValidation.address.displayName;
					updateData.locationLat = addressValidation.address.lat;
					updateData.locationLon = addressValidation.address.lon;
				}
			}
			const success = await updateListing(listing_id, userId, updateData);
			return { success, message: success ? 'Listing updated successfully' : 'Failed to update listing' };
		}

		case 'delete_listing': {
			const { listing_id } = parameters as unknown as { listing_id: string };
			const success = await deleteListing(listing_id, userId);
			return { success, message: success ? 'Listing deleted successfully' : 'Failed to delete listing' };
		}

		case 'validate_address': {
			const { address } = parameters as unknown as { address: string };
			const result = await validateAddress(address);
			if (result.success && result.address) {
				return {
					success: true,
					message: `Address validated: ${result.address.displayName}\nLat: ${result.address.lat}, Lon: ${result.address.lon}`
				};
			}
			return { success: false, message: result.error || 'Failed to validate address' };
		}

		default:
			return { success: false, message: 'Unknown tool' };
	}
}
