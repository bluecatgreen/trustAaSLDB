<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showLatest = $state(true);

	if (data.searchQuery) {
		showLatest = false;
	}

	// Search state
	let searchQuery = $state('');
	let searchResults: Array<{ id: string; name: string; businessName: string | null; email: string }> = $state([]);
	let showDropdown = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;
	let selectedUser: { id: string; name: string; businessName: string | null } | null = $state(null);
	let mobileMenuOpen = $state(false);

	function handleBlur() {
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}

	function handleSearchInput(query: string) {
		searchQuery = query;
		if (searchTimeout) clearTimeout(searchTimeout);

		if (query.length < 1) {
			searchResults = [];
			showDropdown = false;
			selectedUser = null;
			return;
		}

		searchTimeout = setTimeout(async () => {
			const formData = new FormData();
			formData.append('query', query);

			const response = await fetch('/api/search-users', {
				method: 'POST',
				body: formData,
				credentials: 'include'
			});
			const result = await response.json();
			searchResults = result.users || [];
			showDropdown = searchResults.length > 0;
		}, 300);
	}

	function selectUser(user: { id: string; name: string; businessName: string | null; email: string }) {
		selectedUser = { id: user.id, name: user.name, businessName: user.businessName };
		searchQuery = user.businessName ? `${user.name} (${user.businessName})` : user.name;
		showDropdown = false;
	}

	function toggleView(view: 'latest' | 'search') {
		showLatest = view === 'latest';
		if (view === 'latest') {
			searchQuery = '';
			selectedUser = null;
			searchResults = [];
		}
	}

	function performSearch() {
		if (selectedUser) {
			const url = new URL(window.location.href);
			url.searchParams.set('by', 'user');
			url.searchParams.set('q', selectedUser.id);
			url.searchParams.set('name', selectedUser.name);
			window.location.href = url.toString();
		} else if (searchQuery) {
			const url = new URL(window.location.href);
			url.searchParams.set('by', 'email');
			url.searchParams.set('q', searchQuery);
			window.location.href = url.toString();
		}
	}

	function formatDate(date: Date | null): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
	<!-- Simple nav -->
	<nav class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between border-b border-white/10">
		<a href="/" class="text-white font-bold">SharingBusinessExperiences</a>
		<a href="/listing" class="text-purple-300">My Listings</a>
	</nav>

	<main class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
		<h1 class="font-['Space_Grotesk'] text-3xl font-bold text-white mb-6">Search Listings</h1>

		<!-- Toggle Tabs -->
		<div class="flex gap-2 mb-6">
			<button
				type="button"
				onclick={() => toggleView('latest')}
				class="px-4 py-2 rounded-lg font-medium transition-all {showLatest ? 'bg-pink-500 text-white' : 'bg-white/10 text-purple-300 hover:bg-white/20'}"
			>
				Latest Listings
			</button>
			<button
				type="button"
				onclick={() => toggleView('search')}
				class="px-4 py-2 rounded-lg font-medium transition-all {!showLatest ? 'bg-pink-500 text-white' : 'bg-white/10 text-purple-300 hover:bg-white/20'}"
			>
				Search by User
			</button>
		</div>

		<!-- Search Form -->
		{#if !showLatest}
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
				<form onsubmit={(e) => { e.preventDefault(); performSearch(); }}>
					<div class="relative">
						<div class="flex flex-col sm:flex-row gap-3">
							<div class="flex-1 relative">
								<input
									type="text"
									bind:value={searchQuery}
									oninput={(e) => handleSearchInput((e.target as HTMLInputElement).value)}
									onfocus={() => { if (searchResults.length > 0) showDropdown = true; }}
									onblur={handleBlur}
									placeholder="Search by user name or email..."
									class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
								/>
								<!-- Dropdown -->
								{#if showDropdown && searchResults.length > 0}
									<div class="absolute z-50 w-full mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-lg overflow-hidden">
										{#each searchResults as user}
											<button
												type="button"
												class="w-full px-4 py-3 text-left hover:bg-pink-500/20 transition-colors"
												onclick={() => selectUser(user)}
											>
												<div class="text-white font-medium">{user.name}</div>
												{#if user.businessName}
													<div class="text-purple-300 text-sm">{user.businessName}</div>
												{/if}
												<div class="text-purple-400 text-xs">{user.email}</div>
											</button>
										{/each}
									</div>
								{/if}
							</div>
							<button
								type="submit"
								class="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-all"
							>
								Search
							</button>
						</div>
					</div>
				</form>
				{#if selectedUser}
					<p class="text-green-400 text-sm mt-2">Selected: {selectedUser.name}</p>
				{/if}
			</div>
		{/if}

		<!-- Display Listings -->
		<div class="space-y-4">
			{#if !showLatest && data.searchQuery}
				<h2 class="text-xl font-semibold text-white mb-4">
					{#if data.searchBy === 'user' && data.searchName}
						Search Results for "{data.searchName}" ({data.searchResults.length} found)
					{:else}
						Search Results for "{data.searchQuery}" ({data.searchResults.length} found)
					{/if}
				</h2>
				{#if data.searchResults.length === 0}
					<p class="text-purple-300">No listings found for this search.</p>
				{/if}
			{:else}
				<h2 class="text-xl font-semibold text-white mb-4">Latest Listings</h2>
			{/if}

			{#each (showLatest ? data.latestListings : data.searchResults) as item}
				<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-pink-500/50 transition-colors">
					<div class="flex justify-between items-start mb-2">
						<h3 class="text-lg font-semibold text-white">{item.title}</h3>
						<span
							class="px-2 py-1 text-xs rounded-full {item.status === 'active'
								? 'bg-green-500/20 text-green-300'
								: 'bg-gray-500/20 text-gray-300'}"
						>
							{item.status}
						</span>
					</div>

					{#if item.description}
						<p class="text-purple-200 text-sm mb-3">{item.description}</p>
					{/if}

					<div class="flex flex-wrap gap-4 text-sm">
						{#if item.category}
							<span class="text-purple-300">Category: {item.category}</span>
						{/if}
						{#if item.amount}
							<span class="text-white font-medium">{item.currency} {item.amount}</span>
						{/if}
						{#if item.locationName}
							<span class="text-purple-300">Location: {item.locationName}</span>
						{/if}
						<span class="text-purple-300">Created: {formatDate(item.createdAt)}</span>
					</div>

					{#if item.creatorName || item.creatorEmail}
						<div class="mt-3 pt-3 border-t border-white/10">
							<span class="text-sm text-purple-300">Listed by: </span>
							{#if item.creatorName}
								<span class="text-sm text-white">{item.creatorName}</span>
							{/if}
							{#if item.creatorEmail}
								<span class="text-sm text-purple-300"> ({item.creatorEmail})</span>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</main>
</div>