import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { STATICFORMS_ACCESS_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	const subject = body.subject as string;
	const message = body.message as string;
	const email = body.email as string;

	if (!STATICFORMS_ACCESS_KEY || !subject || !message) {
		return json({ success: false, error: 'Missing required fields' }, { status: 400 });
	}

		// Forward to staticforms
	const staticFormsUrl = 'https://api.staticforms.dev/submit';
	const response = await fetch(staticFormsUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			apiKey: STATICFORMS_ACCESS_KEY,
			subject,
			message,
			...(email && { replyTo: email })
		})
	});

	if (response.ok) {
		return json({ success: true });
	} else {
		const errorText = await response.text();
		return json({ success: false, error: errorText }, { status: response.status });
	}
};