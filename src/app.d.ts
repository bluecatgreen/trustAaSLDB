import type { User, Session } from 'better-auth';

type CustomUserFields = {
	isAdmin: boolean;
	isBusiness: boolean;
	businessName: string | null;
	businessAddress: string | null;
};

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User & CustomUserFields;
			session?: Session;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};