import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { businessTransaction, user } from '$lib/server/db/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url, locals }) => {
	const currentUser = locals.user ?? null;
	const userId = url.searchParams.get('userId');

	if (!userId) {
		return {
			user: currentUser,
			ratings: null,
			targetUser: null
		};
	}

	// Get average rating as provider (when other users rated this user as provider)
	const providerResult = await db
		.select({
			avgRating: sql<number>`COALESCE(AVG(${businessTransaction.providerRating}), 0)`,
			count: sql<number>`COUNT(*)`,
			totalRating: sql<number>`SUM(${businessTransaction.providerRating})`
		})
		.from(businessTransaction)
		.where(
			and(
				eq(businessTransaction.providerId, userId),
				isNotNull(businessTransaction.providerRating)
			)
		);

	// Get average rating as receiver (when other users rated this user as receiver)
	const receiverResult = await db
		.select({
			avgRating: sql<number>`COALESCE(AVG(${businessTransaction.receiverRating}), 0)`,
			count: sql<number>`COUNT(*)`,
			totalRating: sql<number>`SUM(${businessTransaction.receiverRating})`
		})
		.from(businessTransaction)
		.where(
			and(
				eq(businessTransaction.receiverId, userId),
				isNotNull(businessTransaction.receiverRating)
			)
		);

	// Get user details from our user table
	const targetUser = await db
		.select({ id: user.id, name: user.name, email: user.email, image: user.image })
		.from(user)
		.where(eq(user.id, userId))
		.get();

	return {
		user: currentUser,
		ratings: {
			asProvider: {
				average: providerResult[0]?.avgRating || 0,
				count: providerResult[0]?.count || 0,
				totalRating: providerResult[0]?.totalRating || 0
			},
			asReceiver: {
				average: receiverResult[0]?.avgRating || 0,
				count: receiverResult[0]?.count || 0,
				totalRating: receiverResult[0]?.totalRating || 0
			}
		},
		targetUser: targetUser ? {
			id: targetUser.id,
			name: targetUser.name,
			email: targetUser.email,
			image: targetUser.image
		} : null
	};
};

export const actions: Actions = {};