import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

export async function POST({ request, locals }) {
	const currentUser = locals.user;
	console.log('[search] currentUser:', JSON.stringify(currentUser));

	if (!currentUser) {
		return json({ users: [], debug: 'no user in locals' });
	}

	const formData = await request.formData();
	const query = formData.get('query') as string;
	console.log('[search] query:', query);

	if (!query || query.length < 1) {
		return json({ users: [] });
	}

	try {
		const allUsers = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				businessName: user.businessName
			})
			.from(user);

		console.log('[search] total users in db:', allUsers.length);
		console.log('[search] all users:', JSON.stringify(allUsers));

		const searchLower = query.toLowerCase();
		const filteredUsers = allUsers
			.filter(u => u.id !== currentUser.id)
			.filter(u =>
				u.name?.toLowerCase().includes(searchLower) ||
				u.businessName?.toLowerCase().includes(searchLower)
			)
			.slice(0, 10);

		console.log('[search] filtered:', filteredUsers.length);

		return json({ users: filteredUsers, debug: { totalInDb: allUsers.length, currentUserId: currentUser.id } });
	} catch (error) {
		console.error('[search] Error:', error);
		return json({ users: [], error: String(error) }, { status: 500 });
	}
}
