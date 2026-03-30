<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ActionData } from './$types';
	import AddressValidator from '$lib/components/AddressValidator.svelte';

	let { form }: { form: ActionData } = $props();

	let isBusiness = $state(false);
	let businessAddress = $state('');

	const message = $derived($page.url.searchParams.get('message'));
	const email = $derived($page.url.searchParams.get('email'));
	let verificationEmail = $derived($page.url.searchParams.get('email') ?? '');
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 font-['Inter']">
	<main class="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-20">
		<div class="text-center space-y-6 sm:space-y-8 mb-8 sm:mb-10">
			<div class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
				<svg class="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
				</svg>
			</div>
			<h1 class="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-white tracking-tight">
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Sign In</span>
			</h1>
			<p class="text-purple-200 text-sm sm:text-base">
				Sign in to access your account
			</p>
		</div>

		<form method="post" action="?/signInEmail" use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'redirect') {
					window.location.href = result.location;
				}
			};
		}} class="space-y-5">
			<div>
				<label class="block text-sm font-medium text-purple-200 mb-2">Email</label>
				<input
					type="email"
					name="email"
					required
					class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
					placeholder="you@example.com"
				/>
			</div>
			<div>
				<label class="block text-sm font-medium text-purple-200 mb-2">Password</label>
				<input
					type="password"
					name="password"
					required
					class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
					placeholder="••••••••"
				/>
				<div class="mt-2 text-right">
					<a href="/demo/better-auth/forgot-password" class="text-sm text-pink-400 hover:text-pink-300 transition-colors">
						Forgot password?
					</a>
				</div>
			</div>
			<div>
				<label class="block text-sm font-medium text-purple-200 mb-2">Name (for registration)</label>
				<input
					name="name"
					class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
					placeholder="Your name"
				/>
			</div>
			<div class="flex items-center gap-3">
				<input
					type="checkbox"
					id="isBusiness"
					name="isBusiness"
					bind:checked={isBusiness}
					class="w-5 h-5 rounded bg-white/5 border border-white/10 text-pink-500 focus:ring-pink-500/20"
				/>
				<label for="isBusiness" class="text-sm text-purple-200">I am representing a small business</label>
			</div>
			{#if isBusiness}
				<div>
					<label class="block text-sm font-medium text-purple-200 mb-2">Business Name</label>
					<input
						type="text"
						name="businessName"
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
						placeholder="Your business name"
					/>
				</div>
				<AddressValidator bind:businessAddress label="Business Address" />
				<input type="hidden" name="businessAddress" value={businessAddress} />
			{/if}
			<div class="flex gap-3 pt-2">
				<button class="flex-1 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-1"
					>Sign In</button
				>
				<button
					formaction="?/signUpEmail"
					class="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1"
				>Register</button
			>
			</div>
		</form>
		{#if form?.message}
			<p class="text-red-400 text-center mt-4 text-sm">{form.message}</p>
		{/if}
		{#if message === 'verification-sent' && email}
			<div class="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
				<div class="flex items-center gap-3 text-green-300">
					<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
					<div>
						<p class="font-medium">Verification email sent!</p>
						<p class="text-sm text-green-300/70">We've sent a verification link to <span class="font-semibold">{email}</span>. Check your inbox and click the link to verify your email.</p>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>
