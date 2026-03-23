import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export async function POST({ request, locals }) {
	const currentUser = locals.user;
	if (!currentUser) {
		return json({ users: [] }, { status: 401 });
	}

	const formData = await request.formData();
	const query = formData.get('query') as string;

	if (!query || query.length < 1) {
		return json({ users: [] });
	}

	try {
		// Search by name or business name (case-insensitive)
		const searchPattern = `%${query}%`;

		// Use raw SQL to properly handle NULL businessName
		const users = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				businessName: user.businessName
			})
			.from(user)
			.where(
				sql`(user.id != ${currentUser.id}) AND (LOWER(user.name) LIKE LOWER(${searchPattern}) OR (user.business_name IS NOT NULL AND LOWER(user.business_name) LIKE LOWER(${searchPattern})))`
			)
			.limit(10);

		return json({ users });
	} catch (error) {
		console.error('Search error:', error);
		return json({ users: [], error: 'Search failed' }, { status: 500 });
	}
}
