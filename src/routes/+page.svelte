<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import type { ActionResult } from '@sveltejs/kit';

	let { data }: { data: PageData } = $props();

	let showLoginModal = $state(false);
	let showRegisterModal = $state(false);
	let isBusiness = $state(false);
	let loginError = $state('');
	let registerError = $state('');
	let transactionMessage = $state('');
	let transactionSuccess = $state(false);
	let verificationEmail = $state('');
	let showVerificationMessage = $state(false);

	// Close modal when user is logged in
	$effect(() => {
		if (data.user) {
			showLoginModal = false;
			showRegisterModal = false;
		}
	});

	// Form state
	let creatorRole = $state('provider');
	let otherPartyName = $state('');
	let otherPartyId = $state('');
	let rating = $state(5);

	function resetTransactionForm() {
		creatorRole = 'provider';
		otherPartyName = '';
		otherPartyId = '';
		rating = 5;
		searchQuery = '';
		searchResults = [];
		// Reset form input fields after a small delay to ensure DOM is updated
		setTimeout(() => {
			document.querySelectorAll('input[name="amount"]').forEach((el) => (el as HTMLInputElement).value = '');
			document.querySelectorAll('input[name="transactionStartDate"]').forEach((el) => (el as HTMLInputElement).value = '');
			document.querySelectorAll('input[name="transactionEndDate"]').forEach((el) => (el as HTMLInputElement).value = '');
			document.querySelectorAll('textarea[name="description"]').forEach((el) => (el as HTMLTextAreaElement).value = '');
			document.querySelectorAll('textarea[name="ratingFeedback"]').forEach((el) => (el as HTMLTextAreaElement).value = '');
		}, 0);
	}

	// Search state
	let searchQuery = $state('');
	let showDropdown = $state(false);
	let searchResults: Array<{ id: string; name: string; businessName: string | null }> = $state([]);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	function handleBlur() {
		// Delay hiding dropdown to allow click event on dropdown items
		setTimeout(() => {
			showDropdown = false;
		}, 200);
	}

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
				body: formData,
				credentials: 'include'
			});
			const result = await response.json();
			if (result.error) {
				console.error('Search error:', result.error);
			}
			searchResults = result.users || [];
			showDropdown = searchResults.length > 0;
		}, 300);
	}

	function selectUser(user: { id: string; name: string; businessName: string | null }) {
		otherPartyId = user.id;
		otherPartyName = user.businessName || user.name;
		searchQuery = user.businessName ? `${user.name} (${user.businessName})` : user.name;
		showDropdown = false;
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 font-['Inter']">
	{#if showVerificationMessage && verificationEmail}
		<div class="max-w-6xl mx-auto px-6 pt-6">
			<div class="p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm relative">
				<div class="flex items-center gap-3 text-green-300">
					<svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
					<div>
						<p class="font-medium">Verification email sent!</p>
						<p class="text-sm text-green-300/70">We've sent a verification link to <span class="font-semibold">{verificationEmail}</span>. Check your inbox and click the link to verify your email.</p>
					</div>
				</div>
				<button onclick={() => { showVerificationMessage = false; }} class="absolute top-4 right-4 text-green-300 hover:text-white">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>
		</div>
	{/if}
	<!-- Header -->
	<header class="border-b border-white/10 bg-white/5 backdrop-blur-sm">
		<nav class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
			<a href="/" class="font-['Space_Grotesk'] text-xl font-bold text-white">
				Sharing<span class="text-pink-400">Business</span>Experiences
			</a>
			{#if data.user}
				<div class="flex items-center gap-4">
					<a href="/transactions" class="text-purple-300 hover:text-white transition-colors text-sm">My Transactions</a>
					<a href="/ratings" class="text-purple-300 hover:text-white transition-colors text-sm">Search Ratings</a>
					<span class="text-purple-200 text-sm">Welcome, {data.user.name}</span>
					<form method="post" action="/demo/better-auth?/signOut" use:enhance>
						<button class="text-sm text-purple-300 hover:text-white transition-colors">Sign Out</button>
					</form>
				</div>
			{:else}
				<div class="flex items-center gap-4">
					<button
						type="button"
						onclick={() => { showLoginModal = true; }}
						class="text-purple-300 hover:text-white transition-colors text-sm"
					>
						Sign In
					</button>
					<button
						type="button"
						onclick={() => { showRegisterModal = true; }}
						class="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-all"
					>
						Register
					</button>
				</div>
			{/if}
		</nav>
	</header>

	<main class="max-w-4xl mx-auto px-6 py-12">
		<div class="text-center space-y-8 mb-12">
			<h1 class="font-['Space_Grotesk'] text-5xl md:text-6xl font-bold text-white tracking-tight">
				Register<span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Business Transaction</span>
			</h1>
		</div>

		{#if data.user}
			<!-- Logged in user - Business Transaction Form -->
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
				<h2 class="font-['Space_Grotesk'] text-2xl font-bold text-white mb-6">Create Business Transaction</h2>
				{#if transactionMessage}
					<div class="mb-6 p-4 rounded-lg {transactionSuccess ? 'bg-green-500/20 border border-green-500/50 text-green-300' : 'bg-red-500/20 border border-red-500/50 text-red-300'}">
						{transactionMessage}
					</div>
				{/if}
				<form
					method="post"
					use:enhance={() => {
						return async ({ result }: { result: ActionResult }) => {
							if (result.type === 'success') {
								transactionMessage = 'Business transaction created successfully!';
								transactionSuccess = true;
								resetTransactionForm();
								// Clear message after 5 seconds
								setTimeout(() => { transactionMessage = ''; }, 5000);
							} else if (result.type === 'failure') {
								transactionMessage = result.data?.message || 'Failed to create transaction';
								transactionSuccess = false;
							}
							await invalidateAll();
						};
					}}
					class="space-y-6"
				>
					<!-- Role Selection -->
					<div>
						<label class="block text-sm font-medium text-purple-200 mb-2">I am the</label>
						<div class="flex gap-4">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="creatorRole"
									value="provider"
									bind:group={creatorRole}
									class="w-4 h-4 text-pink-500"
								/>
								<span class="text-white">Provider</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="creatorRole"
									value="receiver"
									bind:group={creatorRole}
									class="w-4 h-4 text-pink-500"
								/>
								<span class="text-white">Receiver</span>
							</label>
						</div>
					</div>

					<!-- Other Party -->
					<div class="grid md:grid-cols-2 gap-6">
						<div class="relative">
							<label class="block text-sm font-medium text-purple-200 mb-2">
								{creatorRole === 'provider' ? 'Receiver' : 'Provider'} Name
							</label>
							<input
								type="text"
								name="otherPartyName"
								id="otherPartyName"
								required
								bind:value={searchQuery}
								oninput={(e) => handleSearch((e.target as HTMLInputElement).value)}
								onfocus={() => { if (searchResults.length > 0) showDropdown = true; }}
								onblur={handleBlur}
								class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
								placeholder="Search by name or business name"
								autocomplete="off"
							/>
							<input type="hidden" name="otherPartyId" bind:value={otherPartyId} />
							{#if showDropdown && searchResults.length > 0}
								<div class="absolute z-10 w-full mt-1 bg-gray-800 border border-white/10 rounded-xl shadow-lg max-h-60 overflow-auto">
									{#each searchResults as user}
										<button
											type="button"
											class="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors"
											onmousedown={() => selectUser(user)}
										>
											<div class="text-white font-medium">{user.name}</div>
											{#if user.businessName}
												<div class="text-purple-300 text-sm">{user.businessName}</div>
											{/if}
										</button>
									{/each}
								</div>
							{/if}
						</div>
						<div>
							<label class="block text-sm font-medium text-purple-200 mb-2">Amount (USD)</label>
							<input
								type="number"
								name="amount"
								step="0.01"
								class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
								placeholder="0.00"
							/>
						</div>
					</div>

					<!-- Dates -->
					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-medium text-purple-200 mb-2">Transaction Start Date</label>
							<input
								type="date"
								name="transactionStartDate"
								required
								class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-purple-200 mb-2">Transaction End Date (Optional)</label>
							<input
								type="date"
								name="transactionEndDate"
								class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
							/>
						</div>
					</div>

					<!-- Description -->
					<div>
						<label class="block text-sm font-medium text-purple-200 mb-2">Description</label>
						<textarea
							name="description"
							rows="3"
							class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all resize-none"
							placeholder="Describe the business transaction"
						></textarea>
					</div>

					<!-- Rating -->
					<div>
						<label class="block text-sm font-medium text-purple-200 mb-2">
							How would you rate your experience as a {creatorRole}?
						</label>
						<div class="flex gap-2 mb-2">
							{#each [1, 2, 3, 4, 5] as star}
								<button
									type="button"
									onclick={() => { rating = star; }}
									class="text-2xl transition-transform hover:scale-110"
								>
									{#if star <= rating}
										<span class="text-yellow-400">★</span>
									{:else}
										<span class="text-white/30">★</span>
									{/if}
								</button>
							{/each}
							<input type="hidden" name="rating" value={rating} />
						</div>
					</div>

					<!-- Rating Feedback -->
					<div>
						<label class="block text-sm font-medium text-purple-200 mb-2">
							Share your experience (optional)
						</label>
						<textarea
							name="ratingFeedback"
							rows="2"
							class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all resize-none"
							placeholder="Tell us about your experience..."
						></textarea>
					</div>

					<button
						type="submit"
						class="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-1"
					>
						Create Business Transaction
					</button>
				</form>
			</div>
		{:else}
			<!-- Non-logged in user - Business Transaction Form with login prompt -->
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
				<div class="flex items-center gap-2 mb-6 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
					<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p class="text-sm">Sign in or register to save your business transaction</p>
				</div>
				{#if transactionMessage}
					<div class="mb-6 p-4 rounded-lg {transactionSuccess ? 'bg-green-500/20 border border-green-500/50 text-green-300' : 'bg-red-500/20 border border-red-500/50 text-red-300'}">
						{transactionMessage}
					</div>
				{/if}
				<form
					method="post"
					use:enhance={() => {
						return async ({ result }: { result: ActionResult }) => {
							if (result.type === 'success') {
								transactionMessage = 'Business transaction created successfully!';
								transactionSuccess = true;
								resetTransactionForm();
								setTimeout(() => { transactionMessage = ''; }, 5000);
							} else if (result.type === 'failure') {
								transactionMessage = result.data?.message || 'Failed to create transaction';
								transactionSuccess = false;
							}
							await invalidateAll();
						};
					}}
					class="space-y-6"
				>
					<!-- Role Selection -->
					<div>
						<label class="block text-sm font-medium text-purple-200 mb-2">I am the</label>
						<div class="flex gap-4">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="creatorRole"
									value="provider"
									checked
									class="w-4 h-4 text-pink-500"
								/>
								<span class="text-white">Provider</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name="creatorRole"
									value="receiver"
									class="w-4 h-4 text-pink-500"
								/>
								<span class="text-white">Receiver</span>
							</label>
						</div>
					</div>

					<!-- Other Party -->
					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-medium text-purple-200 mb-2">Other Party Name</label>
							<input
								type="text"
								name="otherPartyName"
								required
								class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
								placeholder="Enter other party name"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-purple-200 mb-2">Amount (USD)</label>
							<input
								type="number"
								name="amount"
								step="0.01"
								class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
								placeholder="0.00"
							/>
						</div>
					</div>

					<!-- Dates -->
					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-medium text-purple-200 mb-2">Transaction Start Date</label>
							<input
								type="date"
								name="transactionStartDate"
								required
								class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-purple-200 mb-2">Transaction End Date (Optional)</label>
							<input
								type="date"
								name="transactionEndDate"
								class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all"
							/>
						</div>
					</div>

					<!-- Description -->
					<div>
						<label class="block text-sm font-medium text-purple-200 mb-2">Description</label>
						<textarea
							name="description"
							rows="3"
							class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all resize-none"
							placeholder="Describe the business transaction"
						></textarea>
					</div>

					<!-- Rating -->
					<div>
						<label class="block text-sm font-medium text-purple-200 mb-2">Rating (1-5 stars)</label>
						<div class="flex gap-2 mb-2">
							{#each [1, 2, 3, 4, 5] as star}
								<button
									type="button"
									class="text-2xl text-white/30"
								>
									★
								</button>
							{/each}
							<input type="hidden" name="rating" value="5" />
						</div>
					</div>

					<button
						type="button"
						onclick={() => { showLoginModal = true; }}
						class="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-1"
					>
						Sign In to Create Business Transaction
					</button>
				</form>
			</div>
		{/if}
	</main>
</div>

<!-- Login Modal -->
{#if showLoginModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onclick={() => { showLoginModal = false; loginError = ''; }}>
		<div class="bg-gray-900 border border-white/10 rounded-2xl p-8 w-full max-w-md" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between mb-6">
				<h2 class="font-['Space_Grotesk'] text-2xl font-bold text-white">Sign In</h2>
				<button onclick={() => { showLoginModal = false; loginError = ''; }} class="text-purple-400 hover:text-white">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>
			<form
				method="post"
				action="/demo/better-auth/login?/signInEmail"
				use:enhance={() => {
					return async ({ result }: { result: ActionResult }) => {
						if (result.type === 'failure') {
							loginError = result.data?.message || 'Sign in failed';
						} else {
							// Close modal and reload data to reflect logged-in state
							showLoginModal = false;
							loginError = '';
							await invalidateAll();
						}
					};
				}}
				class="space-y-4"
			>
				{#if loginError}
					<div class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
						{loginError}
					</div>
				{/if}
				<div>
					<label class="block text-sm font-medium text-purple-200 mb-2">Email</label>
					<input
						type="email"
						name="email"
						required
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all"
						placeholder="you@example.com"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-purple-200 mb-2">Password</label>
					<input
						type="password"
						name="password"
						required
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all"
						placeholder="Enter your password"
					/>
				</div>
				<button
					type="submit"
					class="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-1"
				>
					Sign In
				</button>
			</form>
		</div>
	</div>
{/if}

<!-- Register Modal -->
{#if showRegisterModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onclick={() => { showRegisterModal = false; registerError = ''; }}>
		<div class="bg-gray-900 border border-white/10 rounded-2xl p-8 w-full max-w-md" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between mb-6">
				<h2 class="font-['Space_Grotesk'] text-2xl font-bold text-white">Register</h2>
				<button onclick={() => { showRegisterModal = false; registerError = ''; }} class="text-purple-400 hover:text-white">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
				</button>
			</div>
			<form
				method="post"
				action="/demo/better-auth/login?/signUpEmail"
				use:enhance={() => {
					return async ({ result }: { result: ActionResult }) => {
						if (result.type === 'failure') {
							registerError = result.data?.message || 'Registration failed';
						} else if (result.type === 'redirect') {
							// Extract email from redirect URL
							const location = result.location;
							const url = new URL(location, window.location.origin);
							const email = url.searchParams.get('email');
							const message = url.searchParams.get('message');
							if (message === 'verification-sent' && email) {
								verificationEmail = email;
								showVerificationMessage = true;
								showRegisterModal = false;
							} else {
								window.location.href = location;
							}
						} else {
							registerError = '';
						}
					};
				}}
				class="space-y-4"
			>
				{#if registerError}
					<div class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
						{registerError}
					</div>
				{/if}
				<div>
					<label class="block text-sm font-medium text-purple-200 mb-2">Name</label>
					<input
						type="text"
						name="name"
						required
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all"
						placeholder="Your name"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-purple-200 mb-2">Email</label>
					<input
						type="email"
						name="email"
						required
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all"
						placeholder="you@example.com"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-purple-200 mb-2">Password</label>
					<input
						type="password"
						name="password"
						required
						class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all"
						placeholder="Create a password"
					/>
				</div>
				<div class="flex items-center gap-3">
					<input
						type="checkbox"
						id="isBusinessHome"
						name="isBusiness"
						bind:checked={isBusiness}
						class="w-5 h-5 rounded bg-white/5 border border-white/10 text-pink-500 focus:ring-pink-500/20"
					/>
					<label for="isBusinessHome" class="text-sm text-purple-200">I am representing a small business</label>
				</div>
				{#if isBusiness}
					<div>
						<label class="block text-sm font-medium text-purple-200 mb-2">Business Name</label>
						<input
							type="text"
							name="businessName"
							class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all"
							placeholder="Your business name"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-purple-200 mb-2">Business Address</label>
						<textarea
							name="businessAddress"
							rows="2"
							class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all resize-none"
							placeholder="Full business address"
						></textarea>
					</div>
				{/if}
				<button
					type="submit"
					class="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-1"
				>
					Register
				</button>
			</form>
		</div>
	</div>
{/if}
