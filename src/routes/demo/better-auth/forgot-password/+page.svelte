<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
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
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Forgot Password</span>
			</h1>
			<p class="text-purple-200">
				Enter your email address and we'll send you a link to reset your password
			</p>
		</div>

		{#if form?.success}
			<div class="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
				<div class="flex items-center gap-3 text-green-300">
					<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
					<div>
						<p class="font-medium">Reset link sent!</p>
						<p class="text-sm text-green-300/70">If an account exists with that email, we've sent a password reset link. Check your inbox.</p>
					</div>
				</div>
			</div>
			<div class="mt-6 text-center">
				<a href="/demo/better-auth/login" class="text-pink-400 hover:text-pink-300 font-medium transition-colors">
					Back to sign in
				</a>
			</div>
		{:else}
			<form method="post" use:enhance class="space-y-5">
				<div>
					<label class="block text-sm font-medium text-purple-200 mb-2">Email</label>
					<input
						type="email"
						name="email"
						required
						value={form?.email ?? ''}
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
						placeholder="you@example.com"
					/>
				</div>
				{#if form?.message}
					<p class="text-red-400 text-center mt-4 text-sm">{form.message}</p>
				{/if}
				<div class="flex gap-3 pt-2">
					<button class="flex-1 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-1"
						>Send Reset Link</button
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