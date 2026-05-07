import { db } from '$lib/server/db';
import { market, marketAdmin, marketAccessRequest, marketUser, user } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/demo/better-auth');
	}

	// Get markets where the current user is an admin
	const userMarketAdminRoles = await db
		.select({
			marketId: marketAdmin.marketId
		})
		.from(marketAdmin)
		.where(eq(marketAdmin.userId, locals.user.id));

	const adminMarketIds = userMarketAdminRoles.map(m => m.marketId);

	if (adminMarketIds.length === 0) {
		return { user: locals.user, markets: [], pendingRequests: [] };
	}

	// Get market details
	const markets = await db
		.select({
			id: market.id,
			name: market.name,
			country: market.country,
			state: market.state,
			city: market.city,
			suburb: market.suburb
		})
		.from(market)
		.where(inArray(market.id, adminMarketIds));

	// Get pending access requests for these markets
	const pendingRequests = await db
		.select({
			id: marketAccessRequest.id,
			marketId: marketAccessRequest.marketId,
			userId: marketAccessRequest.userId,
			status: marketAccessRequest.status,
			requestedAt: marketAccessRequest.requestedAt,
			userName: user.name,
			userEmail: user.email,
			marketName: market.name
		})
		.from(marketAccessRequest)
		.innerJoin(user, eq(marketAccessRequest.userId, user.id))
		.innerJoin(market, eq(marketAccessRequest.marketId, market.id))
		.where(and(
			eq(marketAccessRequest.status, 'pending'),
			inArray(marketAccessRequest.marketId, adminMarketIds)
		));

	return { user: locals.user, markets, pendingRequests };
};

export const actions = {
	approveRequest: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false, error: 'Please sign in' };
		}

		const formData = await request.formData();
		const requestId = formData.get('requestId') as string;

		if (!requestId) {
			return { success: false, error: 'Request ID is required' };
		}

		try {
			// Get the request details
			const accessRequest = await db
				.select({
					id: marketAccessRequest.id,
					marketId: marketAccessRequest.marketId,
					userId: marketAccessRequest.userId,
					status: marketAccessRequest.status
				})
				.from(marketAccessRequest)
				.where(eq(marketAccessRequest.id, requestId))
				.limit(1);

			if (accessRequest.length === 0) {
				return { success: false, error: 'Request not found' };
			}

			if (accessRequest[0].status && accessRequest[0].status !== 'pending') {
				return { success: false, error: 'Request is not pending' };
			}

			// Verify the current user is an admin for this market
			const adminCheck = await db
				.select({ id: marketAdmin.id })
				.from(marketAdmin)
				.where(and(
					eq(marketAdmin.marketId, accessRequest[0].marketId),
					eq(marketAdmin.userId, locals.user.id)
				))
				.limit(1);

			if (adminCheck.length === 0) {
				return { success: false, error: 'You are not an admin for this market' };
			}

			// Create market_user association
			await db.insert(marketUser).values({
				marketId: accessRequest[0].marketId,
				userId: accessRequest[0].userId
			});

			// Update request status
			await db
				.update(marketAccessRequest)
				.set({
					status: 'approved',
					reviewedAt: new Date(),
					reviewedBy: locals.user.id
				})
				.where(eq(marketAccessRequest.id, requestId));

			return { success: true, message: 'Request approved successfully' };
		} catch (error) {
			console.error('Failed to approve request:', error);
			return { success: false, error: 'Failed to approve request' };
		}
	},

	rejectRequest: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false, error: 'Please sign in' };
		}

		const formData = await request.formData();
		const requestId = formData.get('requestId') as string;

		if (!requestId) {
			return { success: false, error: 'Request ID is required' };
		}

		try {
			// Get the request details
			const accessRequest = await db
				.select({
					id: marketAccessRequest.id,
					marketId: marketAccessRequest.marketId,
					status: marketAccessRequest.status
				})
				.from(marketAccessRequest)
				.where(eq(marketAccessRequest.id, requestId))
				.limit(1);

			if (accessRequest.length === 0) {
				return { success: false, error: 'Request not found' };
			}

			// Verify the current user is an admin for this market
			const adminCheck = await db
				.select({ id: marketAdmin.id })
				.from(marketAdmin)
				.where(and(
					eq(marketAdmin.marketId, accessRequest[0].marketId),
					eq(marketAdmin.userId, locals.user.id)
				))
				.limit(1);

			if (adminCheck.length === 0) {
				return { success: false, error: 'You are not an admin for this market' };
			}

			// Update request status
			await db
				.update(marketAccessRequest)
				.set({
					status: 'rejected',
					reviewedAt: new Date(),
					reviewedBy: locals.user.id
				})
				.where(eq(marketAccessRequest.id, requestId));

			return { success: true, message: 'Request rejected' };
		} catch (error) {
			console.error('Failed to reject request:', error);
			return { success: false, error: 'Failed to reject request' };
		}
	}
};