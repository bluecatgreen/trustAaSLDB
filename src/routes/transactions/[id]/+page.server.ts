import { db } from '$lib/server/db';
import { businessTransaction } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(302, '/demo/better-auth');
	}

	const userId = locals.user.id;

	const transaction = await db
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
		.where(eq(businessTransaction.id, params.id))
		.get();

	if (!transaction) {
		throw redirect(302, '/transactions');
	}

	// Check if user has access to this transaction
	const hasAccess =
		transaction.creatorId === userId ||
		transaction.providerId === userId ||
		transaction.receiverId === userId;

	if (!hasAccess) {
		throw redirect(302, '/transactions');
	}

	// Determine user's role
	let role = 'viewer';
	if (transaction.creatorId === userId) {
		role = transaction.creatorRole || 'creator';
	} else if (transaction.providerId === userId) {
		role = 'provider';
	} else if (transaction.receiverId === userId) {
		role = 'receiver';
	}

	return { transaction, role, user: locals.user };
};

export const actions = {
	updateRating: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const userId = locals.user.id;
		const formData = await request.formData();
		const rating = formData.get('rating');
		const feedback = formData.get('feedback') as string | null;

		if (!rating) {
			return fail(400, { message: 'Rating is required' });
		}

		const ratingValue = parseInt(rating as string);
		if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
			return fail(400, { message: 'Rating must be between 1 and 5' });
		}

		const transaction = await db
			.select()
			.from(businessTransaction)
			.where(eq(businessTransaction.id, params.id))
			.get();

		if (!transaction) {
			return fail(404, { message: 'Transaction not found' });
		}

		// Determine user's role and update accordingly
		let role = '';
		if (transaction.creatorId === userId) {
			role = transaction.creatorRole || 'creator';
		} else if (transaction.providerId === userId) {
			role = 'provider';
		} else if (transaction.receiverId === userId) {
			role = 'receiver';
		} else {
			return fail(403, { message: 'Not authorized to rate this transaction' });
		}

		// Update the appropriate rating field based on role
		if (role === 'provider') {
			await db
				.update(businessTransaction)
				.set({
					providerRating: ratingValue,
					providerRatingFeedback: feedback || null
				})
				.where(eq(businessTransaction.id, params.id));
		} else if (role === 'receiver') {
			await db
				.update(businessTransaction)
				.set({
					receiverRating: ratingValue,
					receiverRatingFeedback: feedback || null
				})
				.where(eq(businessTransaction.id, params.id));
		} else {
			return fail(400, { message: 'Creators cannot rate their own transactions' });
		}

		return { success: true, message: 'Rating updated successfully' };
	}
};
