<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ActionData, PageData } from './$types';

	let { form, data }: { form: ActionData; data: PageData } = $props();

	const token = $derived($page.url.searchParams.get('token') ?? '');
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 font-['Inter']">
	<main class="max-w-md mx-auto px-6 py-20">
		<div class="text-center space-y-8 mb-10">
			<div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
				<svg class="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
				</svg>
			</div>
			<h1 class="font-['Space_Grotesk'] text-4xl font-bold text-white tracking-tight">
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Reset Password</span>
			</h1>
			<p class="text-purple-200">
				Enter your new password below
			</p>
		</div>

		{#if !data?.valid}
			<div class="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
				<div class="flex items-center gap-3 text-red-300">
					<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div>
						<p class="font-medium">Invalid or expired link</p>
						<p class="text-sm text-red-300/70">This password reset link is invalid or has expired. Please request a new one.</p>
					</div>
				</div>
			</div>
			<div class="mt-6 text-center">
				<a href="/demo/better-auth/forgot-password" class="text-pink-400 hover:text-pink-300 font-medium transition-colors">
					Request new reset link
				</a>
			</div>
		{:else if form?.success}
			<div class="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
				<div class="flex items-center gap-3 text-green-300">
					<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<div>
						<p class="font-medium">Password reset successful!</p>
						<p class="text-sm text-green-300/70">Your password has been updated. You can now sign in with your new password.</p>
					</div>
				</div>
			</div>
			<div class="mt-6 text-center">
				<a href="/demo/better-auth/login" class="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-all duration-200">
					Sign in with new password
				</a>
			</div>
		{:else}
			<form method="post" use:enhance class="space-y-5">
				<input type="hidden" name="token" value={token} />
				<div>
					<label class="block text-sm font-medium text-purple-200 mb-2">New Password</label>
					<input
						type="password"
						name="password"
						required
						minlength="8"
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
						placeholder="••••••••"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-purple-200 mb-2">Confirm New Password</label>
					<input
						type="password"
						name="confirmPassword"
						required
						minlength="8"
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
						placeholder="••••••••"
					/>
				</div>
				{#if form?.message}
					<p class="text-red-400 text-center mt-4 text-sm">{form.message}</p>
				{/if}
				<div class="flex gap-3 pt-2">
					<button class="flex-1 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-1"
						>Reset Password</button
					>
				</div>
			</form>
			<div class="mt-6 text-center">
				<a href="/demo/better-auth/login" class="text-pink-400 hover:text-pink-300 font-medium transition-colors">
					Back to sign in
				</a>
			</div>
		{/if}
	</main>
</div>