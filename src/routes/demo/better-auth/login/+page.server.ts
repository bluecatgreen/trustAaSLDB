import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password
				}
			});
		} catch (error) {
			console.error('Signin error:', error);
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Signin failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/');
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const isBusiness = formData.get('isBusiness') === 'on';
		const businessName = formData.get('businessName')?.toString() ?? '';
		const businessAddress = formData.get('businessAddress')?.toString() ?? '';

		try {
			const { user: newUser } = await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					isBusiness,
					businessName: isBusiness ? businessName : undefined,
					businessAddress: isBusiness ? businessAddress : undefined
				}
			});

			// Update user with business information
			if (isBusiness || businessName || businessAddress) {
				await db.update(user)
					.set({
						isBusiness,
						businessName: businessName || null,
						businessAddress: businessAddress || null
					})
					.where(eq(user.id, newUser.id));
			}
		} catch (error) {
			console.error('Signup error:', error);
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return redirect(302, '/demo/better-auth/login?message=verification-sent&email=' + encodeURIComponent(email));
	}
};
