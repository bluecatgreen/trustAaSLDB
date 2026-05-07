import { db } from '$lib/server/db';
import { market, marketAdmin, marketAccessRequest, marketUser, user } from '$lib/server/db/schema';
import { eq, and, count, inArray } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { sendMarketAccessRequestEmail } from '$lib/server/email';
import { env } from '$env/dynamic/private';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/demo/better-auth');
	}

	// Check if user is a market admin for any market
	const userMarketAdminRoles = await db
		.select({ marketId: marketAdmin.marketId })
		.from(marketAdmin)
		.where(eq(marketAdmin.userId, locals.user.id));

	const isMarketAdmin = userMarketAdminRoles.length > 0;

	// Fetch markets with at least one admin
	const marketsWithAdminCount = await db
		.select({
			marketId: marketAdmin.marketId,
			adminCount: count(marketAdmin.id)
		})
		.from(marketAdmin)
		.groupBy(marketAdmin.marketId);

	const marketIdsWithAdmins = marketsWithAdminCount.map(m => m.marketId);

	if (marketIdsWithAdmins.length === 0) {
		return { user: locals.user, markets: [], userRequests: [], isMarketAdmin: false };
	}

	// Fetch markets that have admins
	const markets = await db
		.select({
			id: market.id,
			name: market.name,
			country: market.country,
			countryCode: market.countryCode,
			state: market.state,
			city: market.city,
			suburb: market.suburb,
			neighbourhood: market.neighbourhood,
			road: market.road,
			postcode: market.postcode,
			displayName: market.displayName
		})
		.from(market)
		.where(inArray(market.id, marketIdsWithAdmins));

	// Fetch current user's requests and associations
	const userRequests = await db
		.select({
			id: marketAccessRequest.id,
			marketId: marketAccessRequest.marketId,
			status: marketAccessRequest.status
		})
		.from(marketAccessRequest)
		.where(eq(marketAccessRequest.userId, locals.user.id));

	const userAssociations = await db
		.select({
			marketId: marketUser.marketId
		})
		.from(marketUser)
		.where(eq(marketUser.userId, locals.user.id));

	const associatedMarketIds = new Set(userAssociations.map(a => a.marketId));
	const requestMap = new Map(userRequests.map(r => [r.marketId, r.status]));

	// Add request status and association status to markets
	const marketsWithStatus = markets.map(m => ({
		...m,
		requestStatus: requestMap.get(m.id) || null,
		isAssociated: associatedMarketIds.has(m.id)
	}));

	return { user: locals.user, markets: marketsWithStatus, isMarketAdmin };
};

export const actions = {
	requestAccess: async ({ request, locals }) => {
		if (!locals.user) {
			return { success: false, error: 'Please sign in to request access' };
		}

		const formData = await request.formData();
		const marketId = formData.get('marketId') as string;

		if (!marketId) {
			return { success: false, error: 'Market ID is required' };
		}

		try {
			// Verify market exists and has admins
			const marketAdmins = await db
				.select({
					id: marketAdmin.id,
					userId: marketAdmin.userId
				})
				.from(marketAdmin)
				.where(eq(marketAdmin.marketId, marketId));

			if (marketAdmins.length === 0) {
				return { success: false, error: 'This market does not have any admins yet' };
			}

			// Check if already has a pending request
			const existingRequest = await db
				.select({ id: marketAccessRequest.id })
				.from(marketAccessRequest)
				.where(and(
					eq(marketAccessRequest.marketId, marketId),
					eq(marketAccessRequest.userId, locals.user.id),
					eq(marketAccessRequest.status, 'pending')
				))
				.limit(1);

			if (existingRequest.length > 0) {
				return { success: false, error: 'You already have a pending request for this market' };
			}

			// Check if already associated
			const existingAssociation = await db
				.select({ id: marketUser.id })
				.from(marketUser)
				.where(and(
					eq(marketUser.marketId, marketId),
					eq(marketUser.userId, locals.user.id)
				))
				.limit(1);

			if (existingAssociation.length > 0) {
				return { success: false, error: 'You are already associated with this market' };
			}

			// Get market details
			const marketData = await db
				.select({ name: market.name })
				.from(market)
				.where(eq(market.id, marketId))
				.limit(1);

			if (marketData.length === 0) {
				return { success: false, error: 'Market not found' };
			}

			// Create request
			await db.insert(marketAccessRequest).values({
				marketId,
				userId: locals.user.id
			});

			// Get admin emails
			const adminIds = marketAdmins.map(a => a.userId);
			const adminUsers = await db
				.select({
					id: user.id,
					email: user.email,
					name: user.name
				})
				.from(user)
				.where(inArray(user.id, adminIds));

			// Send email to all market admins
			await sendMarketAccessRequestEmail({
				recipientEmails: adminUsers.map(a => a.email),
				requesterName: locals.user.name,
				requesterEmail: locals.user.email,
				marketName: marketData[0].name || 'Unnamed Market',
				adminDashboardUrl: `${env.ORIGIN || 'http://localhost:5173'}/admin/markets`
			});

			return { success: true, message: 'Access request submitted successfully' };
		} catch (error) {
			console.error('Failed to submit access request:', error);
			return { success: false, error: 'Failed to submit access request' };
		}
	}
};