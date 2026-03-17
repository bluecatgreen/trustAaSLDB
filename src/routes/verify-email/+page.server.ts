import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { verification, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

function decodeJWT(token: string): { email: string; exp: number } | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const payload = parts[1];
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
		const payload = decodeJWT(token);
		if (payload?.email) {
			try {
				const [record] = await db
					.select()
					.from(verification)
					.where(eq(verification.value, token))
					.limit(1);

				if (!record) {
					return { emailVerified: false };
				}

				if (record.expiresAt.getTime() < Date.now()) {
					return { emailVerified: false };
				}

				await db
					.update(user)
					.set({ emailVerified: true })
					.where(eq(user.email, payload.email));

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