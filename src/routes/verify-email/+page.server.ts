import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { verification, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

function decodeJWT(token: string): { email: string; exp: number } | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const payload = parts[1];
		// Add padding if needed
		const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
		const decoded = Buffer.from(padded, 'base64url').toString('utf8');
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (token) {
		// DEBUG: Log all verification records and users
		console.log('DEBUG: Looking for token:', token);
		const allVerification = await db.select().from(verification);
		const allUsers = await db.select({ id: user.id, email: user.email, emailVerified: user.emailVerified }).from(user);
		console.log('DEBUG: All verification records:', JSON.stringify(allVerification, null, 2));
		console.log('DEBUG: All users:', JSON.stringify(allUsers, null, 2));

		// Decode JWT to get email
		const payload = decodeJWT(token);
		if (payload?.email) {
			try {
				// Find the verification record
				const [record] = await db
					.select()
					.from(verification)
					.where(eq(verification.value, token))
					.limit(1);

				if (!record) {
					console.error('Verification record not found for token');
					return { emailVerified: false };
				}

				// Check if expired
				if (record.expiresAt.getTime() < Date.now()) {
					console.error('Verification token expired');
					return { emailVerified: false };
				}

				// Update user's emailVerified to true
				await db
					.update(user)
					.set({ emailVerified: true })
					.where(eq(user.email, payload.email));

				// Delete the verification record
				await db
					.delete(verification)
					.where(eq(verification.id, record.id));

				return { emailVerified: true };
			} catch (e) {
				console.error('Email verification failed:', e);
			}
		}
	}

	return { emailVerified: false };
};