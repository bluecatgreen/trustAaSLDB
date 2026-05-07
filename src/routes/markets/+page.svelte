<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let mobileMenuOpen = $state(false);
	let showSuccess = $state(false);
	let successMessage = $state('');
	let expandedMarketId = $state<string | null>(null);

	function formatAddress(market: any): string {
		const parts = [];
		if (market.suburb) parts.push(market.suburb);
		if (market.city) parts.push(market.city);
		if (market.state) parts.push(market.state);
		if (market.country) parts.push(market.country);
		return parts.join(', ') || market.displayName || market.name || 'No address';
	}

	function toggleMarket(marketId: string) {
		expandedMarketId = expandedMarketId === marketId ? null : marketId;
	}

	$effect(() => {
		if (form?.success) {
			showSuccess = true;
			successMessage = form.message || 'Request submitted successfully';
			setTimeout(() => {
				showSuccess = false;
			}, 5000);
		}
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 font-['Inter']">
	<header class="border-b border-white/10 bg-white/5 backdrop-blur-sm">
		<nav class="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
			<a href="/" class="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-white">
				Sharing<span class="text-pink-400">Business</span>Experiences
			</a>

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
					<a href="/transactions" class="text-purple-300 hover:text-white transition-colors text-sm">Transactions</a>
					<a href="/ratings" class="text-purple-300 hover:text-white transition-colors text-sm">Ratings</a>
					{#if data.isMarketAdmin}
						<a href="/markets/admin" class="text-pink-300 hover:text-white transition-colors text-sm font-medium">Admin Dashboard</a>
					{/if}
					<span class="text-purple-200 text-sm">Welcome, {data.user.name}</span>
					<form method="post" action="/demo/better-auth?/signOut">
						<button class="text-sm text-purple-300 hover:text-white transition-colors">Sign Out</button>
					</form>
				</div>
			{/if}
		</nav>

		{#if mobileMenuOpen}
			<div class="md:hidden border-t border-white/10 bg-gray-900/95 backdrop-blur-sm">
				{#if data.user}
					<div class="px-4 py-4 space-y-3">
						<span class="block text-purple-200 text-sm">Welcome, {data.user.name}</span>
						<a href="/" class="block text-purple-300 hover:text-white transition-colors text-sm">Home</a>
						<a href="/transactions" class="block text-purple-300 hover:text-white transition-colors text-sm">Transactions</a>
						<a href="/ratings" class="block text-purple-300 hover:text-white transition-colors text-sm">Ratings</a>
						{#if data.isMarketAdmin}
							<a href="/markets/admin" class="block text-pink-300 hover:text-white transition-colors text-sm font-medium">Admin Dashboard</a>
						{/if}
						<form method="post" action="/demo/better-auth?/signOut">
							<button class="block w-full text-left text-sm text-purple-300 hover:text-white transition-colors">Sign Out</button>
						</form>
					</div>
				{/if}
			</div>
		{/if}
	</header>

	<main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
		<h1 class="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-white mb-2">Markets</h1>
		<p class="text-purple-200 mb-6">Browse markets with administrators and request access to join.</p>

		{#if showSuccess}
			<div class="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
				{successMessage}
			</div>
		{/if}

		{#if form?.error}
			<div class="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
				{form.error}
			</div>
		{/if}

		{#if data.markets.length === 0}
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
				<p class="text-purple-200">No markets available yet. Markets with administrators will appear here.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.markets as market}
					{@const requestStatus = market.requestStatus}
					{@const isAssociated = market.isAssociated}
					<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
						<div class="flex justify-between items-start mb-3">
							<h2 class="font-['Space_Grotesk'] text-lg font-semibold text-white">{market.name || 'Unnamed Market'}</h2>
						</div>

						<p class="text-purple-200 text-sm mb-4">{formatAddress(market)}</p>

						{#if requestStatus === 'pending'}
							<div class="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm text-center mb-3">
								Request pending approval
							</div>
						{:else if requestStatus === 'approved'}
							<div class="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm text-center mb-3">
								Access approved
							</div>
						{:else if requestStatus === 'rejected'}
							<div class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center mb-3">
								Request was rejected
							</div>
						{:else if isAssociated}
							<div class="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm text-center mb-3">
								You are a member
							</div>
						{:else}
							<form method="POST" action="?/requestAccess">
								<input type="hidden" name="marketId" value={market.id} />
								<button
									type="submit"
									class="w-full px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
								>
									Request Access
								</button>
							</form>
						{/if}

						<button
							type="button"
							onclick={() => toggleMarket(market.id)}
							class="w-full text-center text-purple-300 hover:text-white text-sm transition-colors mt-2"
						>
							{expandedMarketId === market.id ? 'Hide details' : 'View details'}
						</button>

						{#if expandedMarketId === market.id}
							<div class="mt-4 pt-4 border-t border-white/10">
								<div class="grid grid-cols-2 gap-2 text-xs">
									{#if market.country}<span class="text-purple-300">Country:</span><span class="text-white">{market.country}</span>{/if}
									{#if market.state}<span class="text-purple-300">State:</span><span class="text-white">{market.state}</span>{/if}
									{#if market.city}<span class="text-purple-300">City:</span><span class="text-white">{market.city}</span>{/if}
									{#if market.suburb}<span class="text-purple-300">Suburb:</span><span class="text-white">{market.suburb}</span>{/if}
									{#if market.neighbourhood}<span class="text-purple-300">Neighbourhood:</span><span class="text-white">{market.neighbourhood}</span>{/if}
									{#if market.postcode}<span class="text-purple-300">Postcode:</span><span class="text-white">{market.postcode}</span>{/if}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>