<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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

	function formatAmount(amount: string | null): string {
		if (!amount) return '-';
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
		<nav class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
			<a href="/" class="font-['Space_Grotesk'] text-xl font-bold text-white">
				Trust<span class="text-pink-400">AA</span>SLDB
			</a>

			{#if data.user}
				<div class="flex items-center gap-4">
					<a href="/" class="text-purple-300 hover:text-white transition-colors text-sm">Home</a>
					<a href="/transactions" class="text-white font-medium text-sm">Transactions</a>
					<span class="text-purple-200 text-sm">Welcome, {data.user.name}</span>
				</div>
			{:else}
				<div class="flex items-center gap-4">
					<a href="/demo/better-auth" class="text-purple-300 hover:text-white transition-colors text-sm">Sign In</a>
				</div>
			{/if}
		</nav>
	</header>

	<main class="max-w-6xl mx-auto px-6 py-12">
		<h1 class="font-['Space_Grotesk'] text-4xl font-bold text-white mb-8">My Transactions</h1>

		{#if data.transactions.length === 0}
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
				<p class="text-purple-200 text-lg">No transactions found.</p>
				<a href="/" class="inline-block mt-4 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors">
					Create Your First Transaction
				</a>
			</div>
		{:else}
			<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-white/10">
								<th class="px-6 py-4 text-left text-sm font-medium text-purple-200">Date</th>
								<th class="px-6 py-4 text-left text-sm font-medium text-purple-200">Description</th>
								<th class="px-6 py-4 text-left text-sm font-medium text-purple-200">Amount</th>
								<th class="px-6 py-4 text-left text-sm font-medium text-purple-200">My Role</th>
								<th class="px-6 py-4 text-left text-sm font-medium text-purple-200">Provider</th>
								<th class="px-6 py-4 text-left text-sm font-medium text-purple-200">Receiver</th>
								<th class="px-6 py-4 text-left text-sm font-medium text-purple-200">Rating</th>
							</tr>
						</thead>
						<tbody>
							{#each data.transactions as transaction}
								{@const role = getRole(transaction, data.user?.id || '')}
								<tr
									onclick={() => (window.location.href = `/transactions/${transaction.id}`)}
									class="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
								>
									<td class="px-6 py-4 text-white text-sm">
										{formatDate(transaction.createdAt)}
									</td>
									<td class="px-6 py-4 text-white text-sm">
										{transaction.description || '-'}
									</td>
									<td class="px-6 py-4 text-white text-sm font-medium">
										{formatAmount(transaction.amount)}
									</td>
									<td class="px-6 py-4 text-sm">
										<span class="px-3 py-1 rounded-full text-xs font-medium {role === 'provider' ? 'bg-green-500/20 text-green-400' : role === 'receiver' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}">
											{role}
										</span>
									</td>
									<td class="px-6 py-4 text-white text-sm">
										{transaction.providerName || '-'}
									</td>
									<td class="px-6 py-4 text-white text-sm">
										{transaction.receiverName || '-'}
									</td>
									<td class="px-6 py-4 text-white text-sm">
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
