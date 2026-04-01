import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;

		// Fetch additional fields from DB that aren't included in session
		const [dbUser] = await db
			.select({
				isAdmin: user.isAdmin,
				isBusiness: user.isBusiness,
				businessName: user.businessName,
				businessAddress: user.businessAddress
			})
			.from(user)
			.where(eq(user.id, session.user.id));

		event.locals.user = {
			...session.user,
			isAdmin: dbUser?.isAdmin ?? false,
			isBusiness: dbUser?.isBusiness ?? false,
			businessName: dbUser?.businessName ?? null,
			businessAddress: dbUser?.businessAddress ?? null
		};
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
