import { db } from '$lib/server/db';
import { businessTransaction } from '$lib/server/db/schema';
import { eq, or } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/demo/better-auth');
	}

	const userId = locals.user.id;

	const transactions = await db
		.select()
		.from(businessTransaction)
		.where(
			or(
				eq(businessTransaction.creatorId, userId),
				eq(businessTransaction.providerId, userId),
				eq(businessTransaction.receiverId, userId)
			)
		)
		.orderBy(businessTransaction.createdAt);

	return { user: locals.user, transactions };
};
