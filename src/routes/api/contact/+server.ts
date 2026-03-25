import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();

	const accessKey = formData.get('accessKey') as string;
	const subject = formData.get('subject') as string;
	const message = formData.get('message') as string;

	if (!accessKey || !subject || !message) {
		return json({ success: false, error: 'Missing required fields' }, { status: 400 });
	}

	// Forward to staticforms
	const staticFormsUrl = 'https://api.staticforms.xyz/submit';
	const response = await fetch(staticFormsUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			accessKey,
			subject,
			message
		})
	});

	if (response.ok) {
		return json({ success: true });
	} else {
		const errorText = await response.text();
		return json({ success: false, error: errorText }, { status: response.status });
	}
};