import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { user, verification } from '$lib/server/db/auth.schema';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { sendVerificationEmail, sendPasswordResetEmail } from '$lib/server/email';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite', schema }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user: u, token, url }) => {
			const identifier = `email:${u.email}`;
			await db.insert(verification).values({
				id: crypto.randomUUID(),
				identifier,
				value: token,
				expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
				createdAt: new Date(),
				updatedAt: new Date()
			}).onConflictDoNothing();
			await sendPasswordResetEmail(u.email, token, url);
		},
		additionalFields: {
			isBusiness: {
				type: 'boolean',
				defaultValue: false,
				required: false
			},
			businessName: {
				type: 'string',
				required: false
			},
			businessAddress: {
				type: 'string',
				required: false
			},
			isAdmin: {
				type: 'boolean',
				defaultValue: false,
				required: false
			}
		},
		hooks: {
			afterSignUp: async ({ user: newUser }) => {
				const isBusiness = (newUser as any).isBusiness;
				const businessName = (newUser as any).businessName;
				const businessAddress = (newUser as any).businessAddress;

				if (isBusiness || businessName || businessAddress) {
					await db.update(user)
						.set({
							isBusiness: isBusiness ?? false,
							businessName: businessName ?? null,
							businessAddress: businessAddress ?? null
						})
						.where(eq(user.id, newUser.id));
				}
			}
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user: u, token, url }) => {
			// Manually store verification token since adapter might not do it
			const identifier = `email:${u.email}`;
			await db.insert(verification).values({
				id: crypto.randomUUID(),
				identifier,
				value: token,
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
				createdAt: new Date(),
				updatedAt: new Date()
			}).onConflictDoNothing();
			await sendVerificationEmail(u.email, token, url);
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});