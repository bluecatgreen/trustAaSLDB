<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let submitting = $state(false);
	let submitted = $state(false);
	let error = $state('');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		submitting = true;
		error = '';

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		const subject = formData.get('subject') as string;
		const message = formData.get('message') as string;
		const accessKey = formData.get('accessKey') as string;

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ subject, message, accessKey })
			});

			const result = await response.json();

			if (result.success) {
				submitted = true;
			} else {
				error = result.error || 'Something went wrong. Please try again.';
			}
		} catch (e) {
			error = 'Network error. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 font-['Inter']">
	<!-- Header -->
	<header class="border-b border-white/10 bg-white/5 backdrop-blur-sm">
		<nav class="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
			<a href="/" class="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-white">
				Sharing<span class="text-pink-400">Business</span>Experiences
			</a>
			<div class="hidden md:flex items-center gap-4">
				<a href="/about" class="text-purple-300 hover:text-white transition-colors text-sm">About</a>
				<a href="/contact" class="text-purple-300 hover:text-white transition-colors text-sm">Contact</a>
				{#if data.user}
					<a href="/transactions" class="text-purple-300 hover:text-white transition-colors text-sm">My Transactions</a>
					<a href="/ratings" class="text-purple-300 hover:text-white transition-colors text-sm">Search Ratings</a>
				{:else}
					<a href="/demo/better-auth/login" class="text-purple-300 hover:text-white transition-colors text-sm">Sign In</a>
				{/if}
			</div>
		</nav>
	</header>

	<main class="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
		<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
			<h1 class="font-['Space_Grotesk'] text-3xl font-bold text-white mb-2">Contact Us</h1>
			<p class="text-purple-200/70 mb-8">Have a question or feedback? We'd love to hear from you.</p>

			{#if submitted}
				<div class="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300">
					<p class="font-medium">Thank you for your message!</p>
					<p class="text-sm mt-1">We'll get back to you as soon as possible.</p>
				</div>
			{:else}
				<form onsubmit={handleSubmit} class="space-y-6">
					<!-- StaticForms required field (hidden) -->
					<input type="hidden" name="accessKey" value="YOUR_STATICFORMS_ACCESS_KEY" />

					{#if error}
						<div class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
							{error}
						</div>
					{/if}

					<div>
						<label for="subject" class="block text-sm font-medium text-purple-200 mb-2">Subject</label>
						<input
							type="text"
							id="subject"
							name="subject"
							required
							class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
							placeholder="What is this about?"
						/>
					</div>

					<div>
						<label for="message" class="block text-sm font-medium text-purple-200 mb-2">Message</label>
						<textarea
							id="message"
							name="message"
							required
							rows="6"
							class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all resize-none"
							placeholder="Tell us what's on your mind..."
						></textarea>
					</div>

					<button
						type="submit"
						disabled={submitting}
						class="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-1"
					>
						{submitting ? 'Sending...' : 'Send Message'}
					</button>

					<p class="text-xs text-purple-300/50 text-center">
						Powered by StaticForms
					</p>
				</form>
			{/if}
		</div>
	</main>
</div>