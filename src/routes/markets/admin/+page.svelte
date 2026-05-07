<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let mobileMenuOpen = $state(false);
	let showSuccess = $state(false);
	let successMessage = $state('');

	$effect(() => {
		if (form?.success) {
			showSuccess = true;
			successMessage = form.message || 'Action completed successfully';
			setTimeout(() => {
				showSuccess = false;
			}, 3000);
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
					<a href="/markets" class="text-purple-300 hover:text-white transition-colors text-sm">Markets</a>
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
						<a href="/markets" class="block text-purple-300 hover:text-white transition-colors text-sm">Markets</a>
						<form method="post" action="/demo/better-auth?/signOut">
							<button class="block w-full text-left text-sm text-purple-300 hover:text-white transition-colors">Sign Out</button>
						</form>
					</div>
				{/if}
			</div>
		{/if}
	</header>

	<main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
		<h1 class="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-white mb-2">Market Admin Dashboard</h1>
		<p class="text-purple-200 mb-6">Manage access requests for your markets</p>

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
				<p class="text-purple-200 mb-4">You are not an admin for any markets yet.</p>
				<p class="text-purple-300 text-sm">Contact an application admin to be assigned as a market admin.</p>
			</div>
		{:else if data.pendingRequests.length === 0}
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
				<p class="text-purple-200">No pending access requests.</p>
			</div>
		{:else}
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
				<h2 class="font-['Space_Grotesk'] text-xl font-semibold text-white mb-4">Pending Access Requests ({data.pendingRequests.length})</h2>
				<div class="space-y-3">
					{#each data.pendingRequests as request}
						<div class="bg-white/5 rounded-lg p-4 border border-white/5">
							<div class="flex justify-between items-start">
								<div>
									<h3 class="text-white font-medium">{request.userName || 'Unknown User'}</h3>
									<p class="text-purple-300 text-sm">{request.userEmail}</p>
									<p class="text-purple-200 text-sm mt-1">
										Requested access to: <span class="text-white font-medium">{request.marketName || 'Unknown Market'}</span>
									</p>
									<p class="text-purple-300 text-xs mt-1">
										Requested: {request.requestedAt ? new Date(request.requestedAt).toLocaleString() : 'Unknown'}
									</p>
								</div>
								<div class="flex gap-2">
									<form method="POST" action="?/approveRequest">
										<input type="hidden" name="requestId" value={request.id} />
										<button
											type="submit"
											class="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
										>
											Approve
										</button>
									</form>
									<form method="POST" action="?/rejectRequest">
										<input type="hidden" name="requestId" value={request.id} />
										<button
											type="submit"
											class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
										>
											Reject
										</button>
									</form>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if data.markets.length > 0}
			<div class="mt-8">
				<h2 class="font-['Space_Grotesk'] text-xl font-semibold text-white mb-4">Your Markets</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each data.markets as market}
						<div class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
							<h3 class="text-white font-medium">{market.name || 'Unnamed Market'}</h3>
							<p class="text-purple-300 text-sm">
								{[market.suburb, market.city, market.state].filter(Boolean).join(', ')}
							</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</main>
</div>