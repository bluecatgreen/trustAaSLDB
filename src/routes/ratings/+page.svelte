<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Search state
	let searchQuery = $state('');
	let showDropdown = $state(false);
	let searchResults: Array<{ id: string; name: string; email: string; image: string | null }> = $state([]);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	function handleSearch(query: string) {
		searchQuery = query;
		if (searchTimeout) clearTimeout(searchTimeout);

		if (query.length < 1) {
			searchResults = [];
			showDropdown = false;
			return;
		}

		searchTimeout = setTimeout(async () => {
			const formData = new FormData();
			formData.append('query', query);

			const response = await fetch('/api/search-users', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();
			searchResults = result.users || [];
			showDropdown = searchResults.length > 0;
		}, 300);
	}

	function selectUser(user: { id: string; name: string; email: string; image: string | null }) {
		searchQuery = user.name;
		showDropdown = false;
		// Navigate to the ratings page with the user ID
		window.location.href = `/ratings?userId=${user.id}`;
	}

	function renderStars(rating: number): string {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		let stars = '★'.repeat(fullStars);
		if (hasHalfStar) stars += '½';
		return stars;
	}

	function formatRating(rating: number): string {
		return rating.toFixed(1);
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
		<nav class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
			<a href="/" class="font-['Space_Grotesk'] text-xl font-bold text-white">
				Sharing<span class="text-pink-400">Business</span>Experiences
			</a>

			{#if data.user}
				<div class="flex items-center gap-4">
					<a href="/" class="text-purple-300 hover:text-white transition-colors text-sm">Home</a>
					<a href="/transactions" class="text-purple-300 hover:text-white transition-colors text-sm">My Transactions</a>
					<a href="/ratings" class="text-white font-medium text-sm">Search Ratings</a>
					<span class="text-purple-200 text-sm">Welcome, {data.user.name}</span>
					<form method="post" action="/demo/better-auth?/signOut">
						<button class="text-sm text-purple-300 hover:text-white transition-colors">Sign Out</button>
					</form>
				</div>
			{:else}
				<div class="flex items-center gap-4">
					<a href="/demo/better-auth" class="text-purple-300 hover:text-white transition-colors text-sm">Sign In</a>
				</div>
			{/if}
		</nav>
	</header>

	<main class="max-w-4xl mx-auto px-6 py-12">
		<h1 class="font-['Space_Grotesk'] text-4xl font-bold text-white mb-8">User Ratings</h1>

		{#if !data.user}
			<!-- Not logged in -->
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
				<p class="text-purple-200 text-lg mb-4">Please sign in to view user ratings.</p>
				<a href="/demo/better-auth" class="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors">
					Sign In
				</a>
			</div>
		{:else}
			<!-- Search for user -->
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
				<h2 class="text-xl font-semibold text-white mb-4">Look Up User Ratings</h2>
				<div class="relative">
					<label class="block text-sm font-medium text-purple-200 mb-2">Search by name or email</label>
					<input
						type="text"
						value={searchQuery}
						oninput={(e) => handleSearch((e.target as HTMLInputElement).value)}
						onfocus={() => { if (searchResults.length > 0) showDropdown = true; }}
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
						placeholder="Enter name or email..."
						autocomplete="off"
					/>
					{#if showDropdown && searchResults.length > 0}
						<div class="absolute z-10 w-full mt-1 bg-gray-800 border border-white/10 rounded-xl shadow-lg max-h-60 overflow-auto">
							{#each searchResults as user}
								<button
									type="button"
									class="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3"
									onmousedown={() => selectUser(user)}
								>
									{#if user.image}
										<img src={user.image} alt={user.name} class="w-8 h-8 rounded-full" />
									{:else}
										<div class="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-medium">
											{user.name.charAt(0).toUpperCase()}
										</div>
									{/if}
									<div>
										<div class="text-white font-medium">{user.name}</div>
										<div class="text-purple-300 text-sm">{user.email}</div>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			{#if data.ratings && data.targetUser}
				<!-- User ratings display -->
				<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
					<div class="flex items-center gap-4 mb-8">
						<div class="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center text-white text-2xl font-bold">
							{data.targetUser.name.charAt(0).toUpperCase()}
						</div>
						<div>
							<h2 class="text-2xl font-bold text-white">{data.targetUser.name}</h2>
							<p class="text-purple-200">{data.targetUser.email}</p>
						</div>
					</div>

					<div class="grid md:grid-cols-2 gap-6">
						<!-- As Provider -->
						<div class="bg-white/5 rounded-xl border border-white/10 p-6">
							<h3 class="text-lg font-semibold text-white mb-4">As Provider</h3>
							<div class="space-y-4">
								<div>
									<div class="text-4xl font-bold text-white mb-1">
										{formatRating(data.ratings.asProvider.average)}
									</div>
									<div class="text-yellow-400 text-2xl mb-2">
										{renderStars(data.ratings.asProvider.average)}
									</div>
									<p class="text-purple-200 text-sm">
										Based on {data.ratings.asProvider.count} {data.ratings.asProvider.count === 1 ? 'transaction' : 'transactions'}
									</p>
								</div>
								{#if data.ratings.asProvider.count > 0}
									<div class="pt-4 border-t border-white/10">
										<div class="flex justify-between text-sm">
											<span class="text-purple-200">Total rating points:</span>
											<span class="text-white font-medium">{data.ratings.asProvider.totalRating}</span>
										</div>
									</div>
								{/if}
							</div>
						</div>

						<!-- As Receiver -->
						<div class="bg-white/5 rounded-xl border border-white/10 p-6">
							<h3 class="text-lg font-semibold text-white mb-4">As Receiver</h3>
							<div class="space-y-4">
								<div>
									<div class="text-4xl font-bold text-white mb-1">
										{formatRating(data.ratings.asReceiver.average)}
									</div>
									<div class="text-yellow-400 text-2xl mb-2">
										{renderStars(data.ratings.asReceiver.average)}
									</div>
									<p class="text-purple-200 text-sm">
										Based on {data.ratings.asReceiver.count} {data.ratings.asReceiver.count === 1 ? 'transaction' : 'transactions'}
									</p>
								</div>
								{#if data.ratings.asReceiver.count > 0}
									<div class="pt-4 border-t border-white/10">
										<div class="flex justify-between text-sm">
											<span class="text-purple-200">Total rating points:</span>
											<span class="text-white font-medium">{data.ratings.asReceiver.totalRating}</span>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>

					{#if data.ratings.asProvider.count === 0 && data.ratings.asReceiver.count === 0}
						<div class="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
							<p class="text-amber-200 text-sm">
								No ratings yet for this user.
							</p>
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</main>
</div>