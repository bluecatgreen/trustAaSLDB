import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

export async function POST({ request, locals }) {
	const currentUser = locals.user;
	if (!currentUser) {
		return json({ users: [], error: 'No session' }, { status: 200 });
	}

	const formData = await request.formData();
	const query = formData.get('query') as string;

	if (!query || query.length < 1) {
		return json({ users: [] });
	}

	try {
		// Simple search - get all users except current user, then filter in JS
		const allUsers = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				businessName: user.businessName
			})
			.from(user)
			.limit(50);

		// Filter by query in JavaScript (case-insensitive)
		const searchLower = query.toLowerCase();
		const filteredUsers = allUsers
			.filter(u => u.id !== currentUser.id)
			.filter(u =>
				u.name?.toLowerCase().includes(searchLower) ||
				u.businessName?.toLowerCase().includes(searchLower)
			)
			.slice(0, 10);

		return json({ users: filteredUsers });
	} catch (error) {
		console.error('[search] Error:', error);
		return json({ users: [], error: String(error) }, { status: 500 });
	}
}
