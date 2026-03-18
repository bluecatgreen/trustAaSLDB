import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';

		if (!email) {
			return fail(400, { message: 'Email is required', email });
		}

		try {
			await auth.api.requestPasswordReset({
				body: {
					email
				}
			});
		} catch (error) {
			// Don't reveal if the email exists or not for security
			// But log the error for debugging
			console.error('Password reset error:', error);
		}

		// Always return success to prevent email enumeration
		return { success: true };
	}
};