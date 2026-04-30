<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let address = $state('');
	let isLoading = $state(false);
	let addressData = $state<any>(null);
	let selectedFields = $state<string[]>([]);
	let mobileMenuOpen = $state(false);
	let showSuccess = $state(false);
	let editableNeighbourhood = $state('');
	let editableRoad = $state('');

	// Available fields for selection
	const availableFields = [
		{ key: 'country', label: 'Country' },
		{ key: 'countryCode', label: 'Country Code' },
		{ key: 'state', label: 'State' },
		{ key: 'city', label: 'City' },
		{ key: 'suburb', label: 'Suburb' },
		{ key: 'neighbourhood', label: 'Neighbourhood' },
		{ key: 'road', label: 'Road' },
		{ key: 'postcode', label: 'Postcode' }
	];

	function toggleField(fieldKey: string) {
		if (selectedFields.includes(fieldKey)) {
			selectedFields = selectedFields.filter(f => f !== fieldKey);
		} else {
			selectedFields = [...selectedFields, fieldKey];
		}
	}

	function formatDate(date: Date | null): string {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getFieldValue(key: string): string {
		if (!addressData) return '';
		const keyMap: Record<string, string> = {
			country: 'country',
			countryCode: 'countryCode',
			state: 'state',
			city: 'city',
			suburb: 'suburb',
			neighbourhood: 'neighbourhood',
			road: 'street',
			postcode: 'postalCode'
		};
		return addressData[keyMap[key] || key] || '';
	}

	// Reset form state when form submission succeeds
	$effect(() => {
		if (form?.success) {
			showSuccess = true;
			address = '';
			addressData = null;
			selectedFields = [];
			editableNeighbourhood = '';
			editableRoad = '';
			setTimeout(() => {
				showSuccess = false;
			}, 3000);
		}
	});

	// Populate editable fields when address is looked up
	$effect(() => {
		if (form?.address?.neighbourhood) {
			editableNeighbourhood = form.address.neighbourhood;
		}
		if (form?.address?.street) {
			editableRoad = form.address.street;
		}
	});
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
					<a href="/transactions" class="text-purple-300 hover:text-white transition-colors text-sm">Transactions</a>
					<a href="/ratings" class="text-purple-300 hover:text-white transition-colors text-sm">Ratings</a>
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
						<span class="block text-purple-200 text-sm">Welcome, {data.user.name}</span>
						<a href="/" class="block text-purple-300 hover:text-white transition-colors text-sm">Home</a>
						<a href="/transactions" class="block text-purple-300 hover:text-white transition-colors text-sm">Transactions</a>
						<a href="/ratings" class="block text-purple-300 hover:text-white transition-colors text-sm">Ratings</a>
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
		<h1 class="font-['Space_Grotesk'] text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">Manage Markets</h1>

		{#if showSuccess}
			<div class="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
				Market created successfully!
			</div>
		{/if}

		{#if form?.error}
			<div class="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
				{form.error}
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Create Market Form -->
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
				<h2 class="font-['Space_Grotesk'] text-xl font-semibold text-white mb-4">Create New Market</h2>

				<form method="POST" action="?/geocode" class="space-y-4">
					<div>
						<label for="address" class="block text-sm font-medium text-purple-200 mb-2">Enter Address</label>
						<input
							type="text"
							id="address"
							name="address"
							bind:value={address}
							placeholder="e.g., 123 Main Street, New York, USA"
							class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
						/>
					</div>
					<button
						type="submit"
						disabled={isLoading || !address.trim()}
						class="w-full px-4 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-500/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
					>
						{isLoading ? 'Looking up address...' : 'Look Up Address'}
					</button>
				</form>

				{#if form?.success && form?.address}
					{@const addr = form.address}
					<div class="mt-6 pt-6 border-t border-white/10">
						<h3 class="text-sm font-medium text-purple-200 mb-3">Address Details</h3>
						<div class="grid grid-cols-2 gap-3 text-sm">
							<div class="bg-white/5 rounded-lg p-3">
								<span class="text-purple-300 block text-xs">Country</span>
								<span class="text-white">{addr.country || '-'}</span>
							</div>
							<div class="bg-white/5 rounded-lg p-3">
								<span class="text-purple-300 block text-xs">Country Code</span>
								<span class="text-white">{addr.countryCode || '-'}</span>
							</div>
							<div class="bg-white/5 rounded-lg p-3">
								<span class="text-purple-300 block text-xs">State</span>
								<span class="text-white">{addr.state || '-'}</span>
							</div>
							<div class="bg-white/5 rounded-lg p-3">
								<span class="text-purple-300 block text-xs">City</span>
								<span class="text-white">{addr.city || '-'}</span>
							</div>
							<div class="bg-white/5 rounded-lg p-3">
								<span class="text-purple-300 block text-xs">Suburb</span>
								<span class="text-white">{addr.suburb || '-'}</span>
							</div>
							<div class="bg-white/5 rounded-lg p-3">
								<label for="neighbourhood" class="text-purple-300 block text-xs mb-1">Neighbourhood</label>
								<input
									type="text"
									id="neighbourhood"
									bind:value={editableNeighbourhood}
									placeholder="Enter neighbourhood (optional)"
									class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
								/>
							</div>
							<div class="bg-white/5 rounded-lg p-3">
								<label for="road" class="text-purple-300 block text-xs mb-1">Road</label>
								<input
									type="text"
									id="road"
									bind:value={editableRoad}
									placeholder="Enter road (optional)"
									class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
								/>
							</div>
							<div class="bg-white/5 rounded-lg p-3">
								<span class="text-purple-300 block text-xs">Postcode</span>
								<span class="text-white">{addr.postalCode || '-'}</span>
							</div>
						</div>

						<form method="POST" action="?/createMarket" class="mt-6">
							<input type="hidden" name="country" value={addr.country || ''} />
							<input type="hidden" name="countryCode" value={addr.countryCode || ''} />
							<input type="hidden" name="state" value={addr.state || ''} />
							<input type="hidden" name="city" value={addr.city || ''} />
							<input type="hidden" name="suburb" value={addr.suburb || ''} />
							<input type="hidden" name="neighbourhood" value={editableNeighbourhood} />
							<input type="hidden" name="road" value={editableRoad} />
							<input type="hidden" name="houseNumber" value={addr.houseNumber || ''} />
							<input type="hidden" name="postcode" value={addr.postalCode || ''} />
							<input type="hidden" name="lat" value={addr.lat || ''} />
							<input type="hidden" name="lon" value={addr.lon || ''} />
							<input type="hidden" name="displayName" value={addr.displayName || ''} />
							<input type="hidden" name="uniqueFields" value={JSON.stringify(selectedFields)} />

							<h3 class="text-sm font-medium text-purple-200 mb-3">Select Unique Fields</h3>
							<p class="text-xs text-purple-300 mb-3">Choose which fields make this market unique</p>

							<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
								{#each availableFields as field}
									<button
										type="button"
										onclick={() => toggleField(field.key)}
										class="px-3 py-2 rounded-lg text-sm transition-colors {selectedFields.includes(field.key) ? 'bg-pink-500 text-white' : 'bg-white/5 text-purple-200 hover:bg-white/10'}"
									>
										{field.label}
									</button>
								{/each}
							</div>

							{#if selectedFields.length > 0}
								<div class="bg-white/5 rounded-lg p-3 mb-4">
									<span class="text-purple-300 block text-xs mb-1">Selected uniqueness criteria:</span>
									<span class="text-white text-sm">{selectedFields.join(', ')}</span>
								</div>
							{/if}

							<button
								type="submit"
								disabled={selectedFields.length === 0}
								class="w-full px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
							>
								Create Market
							</button>
						</form>
					</div>
				{/if}
			</div>

			<!-- Existing Markets List -->
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
				<h2 class="font-['Space_Grotesk'] text-xl font-semibold text-white mb-4">Existing Markets</h2>

				{#if data.markets.length === 0}
					<p class="text-purple-200 text-center py-8">No markets created yet.</p>
				{:else}
					<div class="space-y-3 max-h-[600px] overflow-y-auto">
						{#each data.markets as market}
							<div class="bg-white/5 rounded-lg p-4 border border-white/5">
								<div class="flex justify-between items-start mb-2">
									<h3 class="text-white font-medium">{market.name || 'Unnamed Market'}</h3>
									<span class="text-xs text-purple-300">{formatDate(market.createdAt)}</span>
								</div>
								<div class="grid grid-cols-2 gap-2 text-xs">
									{#if market.country}<span class="text-purple-300">Country:</span><span class="text-white">{market.country}</span>{/if}
									{#if market.state}<span class="text-purple-300">State:</span><span class="text-white">{market.state}</span>{/if}
									{#if market.city}<span class="text-purple-300">City:</span><span class="text-white">{market.city}</span>{/if}
									{#if market.suburb}<span class="text-purple-300">Suburb:</span><span class="text-white">{market.suburb}</span>{/if}
									{#if market.neighbourhood}<span class="text-purple-300">Neighbourhood:</span><span class="text-white">{market.neighbourhood}</span>{/if}
									{#if market.road}<span class="text-purple-300">Road:</span><span class="text-white">{market.road}</span>{/if}
									{#if market.postcode}<span class="text-purple-300">Postcode:</span><span class="text-white">{market.postcode}</span>{/if}
								</div>
								{#if market.uniqueFields}
									<div class="mt-2 pt-2 border-t border-white/5">
										<span class="text-xs text-purple-300">Unique fields: </span>
										<span class="text-xs text-white">{JSON.parse(market.uniqueFields).join(', ')}</span>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</main>
</div>