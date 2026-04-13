<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	interface Listing {
		id: string;
		title: string;
		description: string | null;
		category: string | null;
		amount: string | null;
		currency: string;
		locationName: string | null;
		locationAddress: string | null;
		listingStartDate: Date | null;
		listingEndDate: Date | null;
		status: string;
		createdAt: Date;
		updatedAt: Date;
	}

	interface Message {
		role: 'user' | 'assistant';
		content: string;
		isLoading?: boolean;
	}

	let { data }: { data: PageData } = $props();

	let mobileMenuOpen = $state(false);

	let messages: Message[] = $state([
		{
			role: 'assistant',
			content: `Hello! I'm your AI Listing Assistant. I can help you create, update, or delete your listings.\n\nFor example, you can say:\n- "Create a new listing for my web design services"\n- "Show me my listings"\n- "Update my electronics listing to $50"\n- "Delete the listing titled 'Old item'"\n\nWhat would you like to do?`
		}
	]);

	let inputMessage = $state('');
	let isLoading = $state(false);

	async function sendMessage() {
		if (!inputMessage.trim() || isLoading) return;

		const userMessage = inputMessage.trim();
		inputMessage = '';

		messages = [...messages, { role: 'user', content: userMessage }];
		messages = [...messages, { role: 'assistant', content: '', isLoading: true }];

		isLoading = true;

		try {
			const formData = new FormData();
			formData.append('message', userMessage);
			formData.append('listings', JSON.stringify(data.listings));

			const response = await fetch('/api/listings/chat', {
				method: 'POST',
				body: formData,
				credentials: 'include'
			});

			const result = await response.json();

			// Remove loading message and add actual response
			messages = messages.filter(m => !m.isLoading);
			messages = [...messages, { role: 'assistant', content: result.response || result.message || 'I apologize, but I received an unexpected response.' }];

			// If listings were modified, reload the page to get updated data
			if (result.modified) {
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			}
		} catch (error) {
			console.error('Error sending message:', error);
			messages = messages.filter(m => !m.isLoading);
			messages = [...messages, { role: 'assistant', content: 'Sorry, I encountered an error processing your request. Please try again.' }];
		}

		isLoading = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
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

			<!-- Mobile menu button -->
			<button
				type="button"
				onclick={() => { mobileMenuOpen = !mobileMenuOpen; }}
				class="md:hidden p-2 text-purple-300 hover:text-white"
			>
				{#if mobileMenuOpen}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>

			{#if data.user}
				<div class="hidden md:flex items-center gap-4">
				    <a href="/" class="text-purple-300 hover:text-white transition-colors text-sm">Home</a>
					<a href="/transactions" class="text-purple-300 hover:text-white transition-colors text-sm">My Transactions</a>
					<a href="/ratings" class="text-purple-300 hover:text-white transition-colors text-sm">Search Ratings</a>
					<a href="/about" class="text-purple-300 hover:text-white transition-colors text-sm">About</a>
					<a href="/contact" class="text-purple-300 hover:text-white transition-colors text-sm">Contact</a>
					<span class="text-purple-200 text-sm">Welcome, {data.user.name}</span>
					<form method="post" action="/demo/better-auth?/signOut" use:enhance>
						<button class="text-sm text-purple-300 hover:text-white transition-colors">Sign Out</button>
					</form>
				</div>
			{:else}
				<div class="hidden md:flex items-center gap-4">
					<a href="/about" class="text-purple-300 hover:text-white transition-colors text-sm">About</a>
					<a href="/demo/better-auth" class="text-purple-300 hover:text-white transition-colors text-sm">Sign In</a>
					<a href="/demo/better-auth" class="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-all">
						Register
					</a>
				</div>
			{/if}
		</nav>

		<!-- Mobile menu dropdown -->
		{#if mobileMenuOpen}
			<div class="md:hidden border-t border-white/10 bg-gray-900/95 backdrop-blur-sm">
				{#if data.user}
					<div class="px-4 py-4 space-y-3">
						<span class="block text-purple-200 text-sm">Welcome, {data.user.name}</span>
						<a href="/transactions" class="block text-purple-300 hover:text-white transition-colors text-sm">My Transactions</a>
						<a href="/listing" class="block text-purple-300 hover:text-white transition-colors text-sm">Listing</a>
						<a href="/ratings" class="block text-purple-300 hover:text-white transition-colors text-sm">Search Ratings</a>
						<a href="/about" class="block text-purple-300 hover:text-white transition-colors text-sm">About</a>
						<a href="/contact" class="block text-purple-300 hover:text-white transition-colors text-sm">Contact</a>
						<form method="post" action="/demo/better-auth?/signOut" use:enhance>
							<button class="block w-full text-left text-sm text-purple-300 hover:text-white transition-colors">Sign Out</button>
						</form>
					</div>
				{:else}
					<div class="px-4 py-4 space-y-3">
						<a href="/about" class="block text-purple-300 hover:text-white transition-colors text-sm">About</a>
						<a href="/demo/better-auth" class="block text-purple-300 hover:text-white transition-colors text-sm">Sign In</a>
						<a href="/demo/better-auth" class="block text-left px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-all">
							Register
						</a>
					</div>
				{/if}
			</div>
		{/if}
	</header>

	<main class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
		<div class="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-10">
			<h1 class="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
				AI<span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Listing</span>Assistant
			</h1>
			<p class="text-purple-200 text-sm sm:text-base max-w-xl mx-auto">
				Manage your business listings with natural language. Create, update, or delete listings simply by asking.
			</p>
		</div>

		<!-- Existing Listings -->
		<div class="mb-8">
			<h2 class="font-['Space_Grotesk'] text-xl font-semibold text-white mb-4">Your Listings</h2>
			{#if data.listings.length === 0}
				<div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
					<p class="text-purple-300">You don't have any listings yet. Use the AI assistant to create your first listing!</p>
				</div>
			{:else}
				<div class="grid gap-4">
					{#each data.listings as listing}
						<div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
							<div class="flex justify-between items-start">
								<div>
									<h3 class="text-white font-medium">{listing.title}</h3>
									{#if listing.description}
										<p class="text-purple-300 text-sm mt-1">{listing.description}</p>
									{/if}
									<div class="flex gap-4 mt-2 text-sm text-purple-200">
										{#if listing.category}
											<span>Category: {listing.category}</span>
										{/if}
										{#if listing.amount}
											<span>{listing.currency} {listing.amount}</span>
										{/if}
										{#if listing.locationName}
											<span>Location: {listing.locationName}</span>
										{/if}
									</div>
								</div>
								<span class="px-2 py-1 text-xs rounded-full {listing.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}">
									{listing.status}
								</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Chat Interface -->
		<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
			<div class="p-4 border-b border-white/10 bg-white/5">
				<h2 class="font-['Space_Grotesk'] text-lg font-semibold text-white">Chat with AI Assistant</h2>
			</div>

			<!-- Messages -->
			<div class="p-4 space-y-4 h-80 overflow-y-auto">
				{#each messages as message}
					<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
						<div class="max-w-[80%] rounded-xl px-4 py-3 {message.role === 'user' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-white/10 text-purple-100'}">
							{#if message.isLoading}
								<div class="flex items-center gap-2">
									<span class="text-sm">Thinking</span>
									<span class="animate-pulse">...</span>
								</div>
							{:else}
								<p class="whitespace-pre-wrap">{message.content}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Input -->
			<div class="p-4 border-t border-white/10">
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={inputMessage}
						onkeydown={handleKeyDown}
						placeholder="Type your message..."
						disabled={isLoading}
						class="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
					/>
					<button
						onclick={sendMessage}
						disabled={isLoading || !inputMessage.trim()}
						class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-pink-500/50 disabled:to-purple-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
					>
						{isLoading ? 'Sending...' : 'Send'}
					</button>
				</div>
			</div>
		</div>
	</main>
</div>