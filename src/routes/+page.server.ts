import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { businessTransaction, user } from '$lib/server/db/schema';
import { desc, eq, ne } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

type BusinessTransaction = InferSelectModel<typeof businessTransaction>;
type User = InferSelectModel<typeof user>;

export const load: PageServerLoad = async ({ locals }) => {
	const currentUser = locals.user ?? null;

	let transactions: BusinessTransaction[] = [];
	let allUsers: Pick<User, 'id' | 'name' | 'email' | 'businessName'>[] = [];
	if (currentUser) {
		transactions = await db
			.select({ id: businessTransaction.id, creatorId: businessTransaction.creatorId, creatorRole: businessTransaction.creatorRole, providerId: businessTransaction.providerId, providerName: businessTransaction.providerName, providerRating: businessTransaction.providerRating, providerRatingFeedback: businessTransaction.providerRatingFeedback, receiverId: businessTransaction.receiverId, receiverName: businessTransaction.receiverName, receiverRating: businessTransaction.receiverRating, receiverRatingFeedback: businessTransaction.receiverRatingFeedback, description: businessTransaction.description, amount: businessTransaction.amount, transactionStartDate: businessTransaction.transactionStartDate, transactionEndDate: businessTransaction.transactionEndDate, createdAt: businessTransaction.createdAt })
			.from(businessTransaction)
			.where(eq(businessTransaction.creatorId, currentUser.id))
			.orderBy(desc(businessTransaction.createdAt)) as BusinessTransaction[];

		allUsers = await db
			.select({ id: user.id, name: user.name, email: user.email, businessName: user.businessName })
			.from(user)
			.where(ne(user.id, currentUser.id)) as Pick<User, 'id' | 'name' | 'email' | 'businessName'>[];
	}

	return {
		user: currentUser,
		transactions,
		allUsers
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const currentUser = locals.user;

		if (!currentUser) {
			return fail(401, { message: 'You must be logged in to create a business transaction' });
		}

		const formData = await request.formData();
		const creatorRole = formData.get('creatorRole') as string;
		const otherPartyId = formData.get('otherPartyId') as string;
		const otherPartyName = formData.get('otherPartyName') as string;
		const description = formData.get('description') as string;
		const amount = formData.get('amount') as string;
		const transactionStartDate = formData.get('transactionStartDate') as string;
		const transactionEndDate = formData.get('transactionEndDate') as string;
		const rating = formData.get('rating') as string;
		const ratingFeedback = formData.get('ratingFeedback') as string;

		console.log('[DEBUG] otherPartyId:', JSON.stringify(otherPartyId), '| otherPartyName:', otherPartyName);

		if (!creatorRole || !otherPartyName || !transactionStartDate || !rating) {
			return fail(400, { message: 'Missing required fields' });
		}

		if (creatorRole !== 'provider' && creatorRole !== 'receiver') {
			return fail(400, { message: 'Invalid role selected' });
		}

		// Validate that the other party is a registered user
		if (!otherPartyId) {
			console.log('[DEBUG] Validation failed: otherPartyId is empty');
			return fail(400, { message: 'Please select a registered user as the other party' });
		}

		// Check if the other party exists in the database
		const otherParty = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.id, otherPartyId))
			.get();

		if (!otherParty) {
			console.log('[DEBUG] Validation failed: otherParty not found in DB');
			return fail(400, { message: 'The selected user is not a registered user. Please select a registered user.' });
		}

		// Prevent creating a transaction with yourself
		if (otherPartyId === currentUser.id) {
			return fail(400, { message: 'You cannot create a transaction with yourself' });
		}

		const transactionData: Record<string, unknown> = {
			creatorId: currentUser.id,
			creatorRole,
			description: description || null,
			amount: amount || null,
			transactionStartDate: new Date(transactionStartDate),
			transactionEndDate: transactionEndDate ? new Date(transactionEndDate) : null,
		};

		if (creatorRole === 'provider') {
			transactionData.providerId = currentUser.id;
			transactionData.providerName = currentUser.name;
			transactionData.providerRating = parseInt(rating, 10);
			transactionData.providerRatingFeedback = ratingFeedback || null;
			transactionData.receiverId = otherPartyId || null;
			transactionData.receiverName = otherPartyName;
		} else {
			transactionData.receiverId = currentUser.id;
			transactionData.receiverName = currentUser.name;
			transactionData.receiverRating = parseInt(rating, 10);
			transactionData.receiverRatingFeedback = ratingFeedback || null;
			transactionData.providerId = otherPartyId || null;
			transactionData.providerName = otherPartyName;
		}

		await db.insert(businessTransaction).values(transactionData);

		return { success: true, message: 'Business transaction created successfully!' };
	}
};
