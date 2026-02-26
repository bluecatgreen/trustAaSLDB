import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { ne, like, or, sql } from 'drizzle-orm';

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

	// Search by name or business name (case-insensitive)
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
			sql`${ne(user.id, currentUser.id)} AND (${like(user.name, searchPattern)} OR ${like(user.businessName, searchPattern)})`
		)
		.limit(10);

	return json({ users });
}
