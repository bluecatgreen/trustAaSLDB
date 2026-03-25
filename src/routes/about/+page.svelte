<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
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
			<div class="hidden md:flex items-center gap-4">
				<a href="/about" class="text-purple-300 hover:text-white transition-colors text-sm">About</a>
				<a href="/contact" class="text-purple-300 hover:text-white transition-colors text-sm">Contact</a>
				{#if data.user}
					<a href="/transactions" class="text-purple-300 hover:text-white transition-colors text-sm">My Transactions</a>
					<a href="/ratings" class="text-purple-300 hover:text-white transition-colors text-sm">Search Ratings</a>
				{:else}
					<a href="/demo/better-auth/login" class="text-purple-300 hover:text-white transition-colors text-sm">Sign In</a>
				{/if}
			</div>
		</nav>
	</header>

	<main class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
		<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
			<h1 class="font-['Space_Grotesk'] text-3xl font-bold text-white mb-6">About</h1>

			<div class="prose prose-invert prose-purple max-w-none">
				<p class="text-purple-200 text-lg leading-relaxed mb-6">
					[PLACEHOLDER: Add your about text here]
				</p>

				<p class="text-purple-200/80 leading-relaxed mb-4">
					This platform allows businesses to register their business transactions and share their experiences.
					By rating and reviewing other businesses, we create a trusted network of commercial relationships.
				</p>

				<p class="text-purple-200/80 leading-relaxed mb-4">
					Whether you're a small business owner, freelancer, or enterprise, this platform helps you
					build credibility and make informed decisions about your business partners.
				</p>

				<h2 class="font-['Space_Grotesk'] text-xl font-bold text-white mt-8 mb-4">Our Mission</h2>
				<p class="text-purple-200/80 leading-relaxed mb-4">
					To create a transparent and trustworthy business environment where companies can
					share their experiences and help others make better business decisions.
				</p>
			</div>
		</div>
	</main>
</div>