<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let mobileMenuOpen = $state(false);

	function getRole(transaction: any, userId: string): string {
		if (transaction.creatorId === userId) {
			return transaction.creatorRole || 'creator';
		}
		if (transaction.providerId === userId) {
			return 'provider';
		}
		if (transaction.receiverId === userId) {
			return 'receiver';
		}
		return 'unknown';
	}

	function formatDate(date: Date | null): string {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	// Currency symbols map
	const currencySymbols: Record<string, string> = {
		USD: '$',
		GBP: '£',
		EUR: '€',
		INR: '₹',
		CHF: 'Fr',
		CAD: 'C$',
		AUD: 'A$'
	};

	function formatAmount(amount: string | null): string {
		if (!amount) return '-';
		// Format is "100.00 USD" - parse to show properly
		const parts = amount.split(' ');
		if (parts.length >= 2) {
			const currencyCode = parts[parts.length - 1];
			const currencySymbol = currencySymbols[currencyCode] || currencyCode + ' ';
			return `${currencySymbol}${parts.slice(0, -1).join(' ')}`;
		}
		return `$${amount}`;
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
					<a href="/ratings" class="text-purple-300 hover:text-white transition-colors text-sm">Search Ratings</a>
					<span class="text-purple-200 text-sm">Welcome, {data.user.name}</span>
					<form method="post" action="/demo/better-auth?/signOut">
						<button class="text-sm text-purple-300 hover:text-white transition-colors">Sign Out</button>
					</form>
				</div>
			{:else}
				<div class="hidden md:flex items-center gap-4">
					<a href="/demo/better-auth" class="text-purple-300 hover:text-white transition-colors text-sm">Sign In</a>
				</div>
			{/if}
		</nav>

		<!-- Mobile menu dropdown -->
		{#if mobileMenuOpen}
			<div class="md:hidden border-t border-white/10 bg-gray-900/95 backdrop-blur-sm">
				{#if data.user}
					<div class="px-4 py-4 space-y-3">
					<a href="/ratings" class="text-purple-300 hover:text-white transition-colors text-sm">Search Ratings</a>
					<a href="/listing" class="text-purple-300 hover:text-white transition-colors text-sm">My Listings</a>
					<a href="/listing-search" class="text-purple-300 hover:text-white transition-colors text-sm">Search Listings</a>
					<a href="/contact" class="text-purple-300 hover:text-white transition-colors text-sm">Contact</a>
					<a href="/about" class="text-purple-300 hover:text-white transition-colors text-sm">About</a>
						<form method="post" action="/demo/better-auth?/signOut">
							<button class="block w-full text-left text-sm text-purple-300 hover:text-white transition-colors">Sign Out</button>
						</form>
					</div>
				{:else}
					<div class="px-4 py-4 space-y-3">
						<a href="/demo/better-auth" class="block text-purple-300 hover:text-white transition-colors text-sm">Sign In</a>
					</div>
				{/if}
			</div>
		{/if}
	</header>

	<main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
		<h1 class="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">My Transactions</h1>

		{#if data.transactions.length === 0}
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 sm:p-12 text-center">
				<p class="text-purple-200 text-lg">No transactions found.</p>
				<a href="/" class="inline-block mt-4 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors">
					Create Your First Transaction
				</a>
			</div>
		{:else}
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
				<div class="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
					<table class="w-full min-w-[600px] sm:min-w-0">
						<thead>
							<tr class="border-b border-white/10">
								<th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-purple-200">Date</th>
								<th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-purple-200">Description</th>
								<th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-purple-200">Amount</th>
								<th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-purple-200">Role</th>
								<th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-purple-200">Provider</th>
								<th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-purple-200">Receiver</th>
								<th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-purple-200">Rating</th>
							</tr>
						</thead>
						<tbody>
							{#each data.transactions as transaction}
								{@const role = getRole(transaction, data.user?.id || '')}
								<tr
									onclick={() => (window.location.href = `/transactions/${transaction.id}`)}
									class="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
								>
									<td class="px-4 sm:px-6 py-3 sm:py-4 text-white text-xs sm:text-sm">
										{formatDate(transaction.createdAt)}
									</td>
									<td class="px-4 sm:px-6 py-3 sm:py-4 text-white text-xs sm:text-sm">
										{transaction.description || '-'}
									</td>
									<td class="px-4 sm:px-6 py-3 sm:py-4 text-white text-xs sm:text-sm font-medium">
										{formatAmount(transaction.amount)}
									</td>
									<td class="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
										<span class="px-2 sm:px-3 py-1 rounded-full text-xs font-medium {role === 'provider' ? 'bg-green-500/20 text-green-400' : role === 'receiver' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}">
											{role}
										</span>
									</td>
									<td class="px-4 sm:px-6 py-3 sm:py-4 text-white text-xs sm:text-sm">
										{transaction.providerName || '-'}
									</td>
									<td class="px-4 sm:px-6 py-3 sm:py-4 text-white text-xs sm:text-sm">
										{transaction.receiverName || '-'}
									</td>
									<td class="px-4 sm:px-6 py-3 sm:py-4 text-white text-xs sm:text-sm">
										{#if role === 'provider' || role === transaction.creatorRole}
											{#if transaction.providerRating}
												<span class="text-yellow-400">
													{'★'.repeat(transaction.providerRating)}
												</span>
											{:else}
												-
											{/if}
										{:else if role === 'receiver'}
											{#if transaction.receiverRating}
												<span class="text-yellow-400">
													{'★'.repeat(transaction.receiverRating)}
												</span>
											{:else}
												-
											{/if}
										{:else}
											-
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</main>
</div>
