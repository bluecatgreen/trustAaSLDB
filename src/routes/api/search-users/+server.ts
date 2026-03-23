import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export async function POST({ request, locals }) {
	console.log('[search] locals.user:', locals.user);
	console.log('[search] cookies:', request.headers.get('cookie')?.substring(0, 50));

	const currentUser = locals.user;
	if (!currentUser) {
		return json({ users: [], error: 'No session', debug: { hasUser: false } }, { status: 200 });
	}

	const formData = await request.formData();
	const query = formData.get('query') as string;

	if (!query || query.length < 1) {
		return json({ users: [] });
	}

	try {
		const searchPattern = `%${query}%`;

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
		console.error('[search] Error:', error);
		return json({ users: [], error: String(error) }, { status: 500 });
	}
}
