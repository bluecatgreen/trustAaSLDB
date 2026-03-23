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
		.select({
			id: businessTransaction.id,
			creatorId: businessTransaction.creatorId,
			creatorRole: businessTransaction.creatorRole,
			providerId: businessTransaction.providerId,
			providerName: businessTransaction.providerName,
			providerRating: businessTransaction.providerRating,
			providerRatingFeedback: businessTransaction.providerRatingFeedback,
			receiverId: businessTransaction.receiverId,
			receiverName: businessTransaction.receiverName,
			receiverRating: businessTransaction.receiverRating,
			receiverRatingFeedback: businessTransaction.receiverRatingFeedback,
			description: businessTransaction.description,
			amount: businessTransaction.amount,
			transactionStartDate: businessTransaction.transactionStartDate,
			transactionEndDate: businessTransaction.transactionEndDate,
			createdAt: businessTransaction.createdAt
		})
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
