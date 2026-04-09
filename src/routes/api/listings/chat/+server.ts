import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processListingAgent, executeToolCall, type UserListing, type ToolCall } from '$lib/server/ai/listing-agent';

export const POST: RequestHandler = async ({ request, locals }) => {
	const currentUser = locals.user;

	if (!currentUser) {
		return json({ response: 'Please sign in to use the AI Listing Assistant.', modified: false }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const message = formData.get('message') as string;
		const listingsJson = formData.get('listings') as string;

		if (!message) {
			return json({ response: 'Please provide a message.', modified: false }, { status: 400 });
		}

		let existingListings: UserListing[] = [];
		if (listingsJson) {
			try {
				existingListings = JSON.parse(listingsJson);
			} catch (e) {
				console.error('Error parsing listings:', e);
			}
		}

		// Process message with AI agent
		const result = await processListingAgent(currentUser.id, message, existingListings);

		// Execute any tool calls
		let modified = false;
		if (result.toolCalls && result.toolCalls.length > 0) {
			for (const toolCall of result.toolCalls) {
				const toolResult = await executeToolCall(currentUser.id, toolCall);
				if (toolResult.success) {
					modified = true;
					result.response += '\n\n' + toolResult.message;
				} else {
					result.response += '\n\nError: ' + toolResult.message;
				}
			}
		}

		return json({
			response: result.response,
			modified
		});
	} catch (error) {
		console.error('Chat error:', error);
		return json({ response: 'I apologize, but I encountered an error processing your request.', modified: false }, { status: 500 });
	}
};