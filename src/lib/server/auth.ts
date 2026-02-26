import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: {
		enabled: true,
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
			}
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
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
