import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';

/**
 * Check if a user is an admin by their user ID
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
	const result = await db.query.user.findFirst({
		where: eq(user.id, userId),
		columns: { isAdmin: true }
	});
	return result?.isAdmin ?? false;
}

/**
 * Get the current user from the session and check if they are an admin.
 * Returns the admin status - use in server load functions or API routes.
 */
export async function getAdminStatus(): Promise<boolean> {
	const { cookies } = await import('cookie');
	const event = await import('$app/server').then(m => m.getRequestEvent());
	if (!event) return false;

	const sessionToken = event.cookies.get('better-auth.session_token');
	if (!sessionToken) return false;

	const { session, user: currentUser } = await import('$lib/server/auth').then(
		auth => auth.auth.api.getSession({ headers: event.request.headers })
	);

	if (!session || !currentUser) return false;

	return currentUser.isAdmin ?? false;
}