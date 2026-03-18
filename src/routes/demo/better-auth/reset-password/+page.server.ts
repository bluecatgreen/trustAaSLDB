import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}

	const token = event.url.searchParams.get('token');
	if (!token) {
		return { valid: false };
	}

	// Verify the token is valid by trying to use it - Better Auth doesn't have a verify endpoint
	// We'll just check if the token looks valid (non-empty)
	try {
		const valid = !!token && token.length > 0;
		return { valid };
	} catch {
		return { valid: false };
	}
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const token = formData.get('token')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';

		if (!token || !password) {
			return fail(400, { message: 'Token and password are required' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		if (password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters' });
		}

		try {
			await auth.api.resetPassword({
				body: {
					newPassword: password,
					token
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Password reset failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return { success: true };
	}
};