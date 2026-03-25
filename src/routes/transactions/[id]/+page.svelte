<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const { transaction, role, user } = data;

	let selectedRating = $state(
		role === 'provider' ? (transaction.providerRating || 0) :
		role === 'receiver' ? (transaction.receiverRating || 0) : 0
	);
	let feedback = $state(
		role === 'provider' ? (transaction.providerRatingFeedback || '') :
		role === 'receiver' ? (transaction.receiverRatingFeedback || '') : ''
	);
	let isSubmitting = $state(false);

	function formatDate(date: Date | null): string {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatDateTime(date: Date | null): string {
		if (!date) return '-';
		return new Date(date).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatAmount(amount: string | null): string {
		if (!amount) return '-';
		return `$${amount}`;
	}

	function getStars(rating: number | null): string {
		if (!rating) return '-';
		return '★'.repeat(rating) + '☆'.repeat(5 - rating);
	}

	const canRate = role === 'provider' || role === 'receiver';
	const hasRated = role === 'provider' ? !!transaction.providerRating : role === 'receiver' ? !!transaction.receiverRating : false;
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
			{#if user}
				<div class="flex items-center gap-2 sm:gap-4">
					<a href="/" class="text-purple-300 hover:text-white transition-colors text-xs sm:text-sm">Home</a>
					<a href="/transactions" class="text-white font-medium text-xs sm:text-sm">Transactions</a>
					<span class="text-purple-200 text-xs sm:text-sm hidden sm:inline">Welcome, {user.name}</span>
				</div>
			{:else}
				<div class="flex items-center gap-4">
					<a href="/demo/better-auth" class="text-purple-300 hover:text-white transition-colors text-sm">Sign In</a>
				</div>
			{/if}
		</nav>
	</header>

	<main class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
		<a href="/transactions" class="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-6">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back to Transactions
		</a>

		{#if form?.success}
			<div class="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6 text-green-300">
				{form.message}
			</div>
		{:else if form?.message}
			<div class="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300">
				{form.message}
			</div>
		{/if}

		<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
			<div class="flex items-center justify-between mb-8">
				<h1 class="font-['Space_Grotesk'] text-3xl font-bold text-white">Transaction Details</h1>
				<span class="px-4 py-2 rounded-full text-sm font-medium {role === 'provider' ? 'bg-green-500/20 text-green-400' : role === 'receiver' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}">
					Your Role: {role}
				</span>
			</div>

			<div class="space-y-6">
				<!-- Amount -->
				<div class="bg-white/5 rounded-xl p-6">
					<p class="text-purple-200 text-sm mb-1">Amount</p>
					<p class="text-4xl font-bold text-white">{formatAmount(transaction.amount)}</p>
				</div>

				<!-- Description -->
				<div>
					<h2 class="text-purple-200 text-sm mb-2">Description</h2>
					<p class="text-white text-lg">{transaction.description || 'No description provided'}</p>
				</div>

				<!-- Dates -->
				<div class="grid md:grid-cols-2 gap-6">
					<div>
						<h2 class="text-purple-200 text-sm mb-2">Transaction Start Date</h2>
						<p class="text-white">{formatDate(transaction.transactionStartDate)}</p>
					</div>
					<div>
						<h2 class="text-purple-200 text-sm mb-2">Transaction End Date</h2>
						<p class="text-white">{formatDate(transaction.transactionEndDate) || 'Not specified'}</p>
					</div>
				</div>

				<!-- Participants -->
				<div class="border-t border-white/10 pt-6">
					<h2 class="text-purple-200 text-sm mb-4">Participants</h2>
					<div class="grid md:grid-cols-2 gap-6">
						<div class="bg-white/5 rounded-xl p-4">
							<p class="text-purple-300 text-sm mb-1">Provider</p>
							<p class="text-white font-medium">{transaction.providerName || 'Not specified'}</p>
							{#if transaction.providerRating}
								<p class="text-yellow-400 mt-1">{getStars(transaction.providerRating)}</p>
							{/if}
							{#if transaction.providerRatingFeedback}
								<p class="text-purple-200 text-sm mt-2">"{transaction.providerRatingFeedback}"</p>
							{/if}
						</div>
						<div class="bg-white/5 rounded-xl p-4">
							<p class="text-purple-300 text-sm mb-1">Receiver</p>
							<p class="text-white font-medium">{transaction.receiverName || 'Not specified'}</p>
							{#if transaction.receiverRating}
								<p class="text-yellow-400 mt-1">{getStars(transaction.receiverRating)}</p>
							{/if}
							{#if transaction.receiverRatingFeedback}
								<p class="text-purple-200 text-sm mt-2">"{transaction.receiverRatingFeedback}"</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Creator's Comments -->
				<div class="border-t border-white/10 pt-6">
					<h2 class="text-purple-200 text-sm mb-4">Creator's Comments</h2>
					<div class="bg-white/5 rounded-xl p-4">
						<p class="text-purple-300 text-sm mb-2">
							Created as: {transaction.creatorRole || 'unknown'}
						</p>
						<p class="text-white">
							{transaction.description || 'No comments provided by the creator.'}
						</p>
					</div>
				</div>

				<!-- Rate Transaction Form -->
				{#if canRate}
					<div class="border-t border-white/10 pt-6">
						<h2 class="text-purple-200 text-sm mb-4">
							{hasRated ? 'Update Your Rating' : 'Rate This Transaction'}
						</h2>
						<div class="bg-white/5 rounded-xl p-6">
							<form
								method="POST"
								action="?/updateRating"
								use:enhance={() => {
									isSubmitting = true;
									return async ({ update }) => {
										await update();
										isSubmitting = false;
									};
								}}
							>
								<!-- Star Rating -->
								<div class="mb-4">
									<label class="block text-sm font-medium text-purple-200 mb-2">
										How would you rate your experience as a {role}?
									</label>
									<div class="flex gap-2">
										{#each [1, 2, 3, 4, 5] as star}
											<button
												type="button"
												onclick={() => { selectedRating = star; }}
												class="text-3xl transition-transform hover:scale-110 focus:outline-none"
											>
												{#if star <= selectedRating}
													<span class="text-yellow-400">★</span>
												{:else}
													<span class="text-white/30">★</span>
												{/if}
											</button>
										{/each}
										<input type="hidden" name="rating" value={selectedRating} />
									</div>
								</div>

								<!-- Feedback -->
								<div class="mb-4">
									<label for="feedback" class="block text-sm font-medium text-purple-200 mb-2">
										Share your experience (optional)
									</label>
									<textarea
										id="feedback"
										name="feedback"
										rows="3"
										bind:value={feedback}
										class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none backdrop-blur-sm transition-all resize-none"
										placeholder="Tell us about your experience..."
									></textarea>
								</div>

								<button
									type="submit"
									disabled={isSubmitting || selectedRating === 0}
									class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSubmitting ? 'Saving...' : hasRated ? 'Update Rating' : 'Submit Rating'}
								</button>
							</form>
						</div>
					</div>
				{/if}

				<!-- Metadata -->
				<div class="border-t border-white/10 pt-6 text-sm text-purple-300">
					<p>Created: {formatDateTime(transaction.createdAt)}</p>
					<p class="mt-1">Transaction ID: {transaction.id}</p>
				</div>
			</div>
		</div>
	</main>
</div>
