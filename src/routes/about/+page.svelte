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
				{#if data.user}
					<a href="/contact" class="text-purple-300 hover:text-white transition-colors text-sm">Contact</a>
					<a href="/transactions" class="text-purple-300 hover:text-white transition-colors text-sm">My Transactions</a>
					<a href="/ratings" class="text-purple-300 hover:text-white transition-colors text-sm">Search Ratings</a>
				{/if}
				<a href="/demo/better-auth/login" class="text-purple-300 hover:text-white transition-colors text-sm">{data.user ? 'Sign Out' : 'Sign In'}</a>
			</div>
		</nav>
	</header>

	<main class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
		<div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
			<h1 class="font-['Space_Grotesk'] text-3xl font-bold text-white mb-6">About</h1>

			<div class="prose prose-invert prose-purple max-w-none">
				<p class="text-purple-200 text-lg leading-relaxed mb-6">
					Our platform provides an intelligent Listing Management system powered by AI Agents to help businesses create, manage, and improve their listings with ease.
				</p>

				<h2 class="font-['Space_Grotesk'] text-xl font-bold text-white mt-8 mb-4">AI-Powered Listing Management</h2>
				<p class="text-purple-200/80 leading-relaxed mb-4">
					Our platform features an intelligent AI Agent that helps users manage their business listings through natural conversation. Powered by <strong>Vercel AI SDK</strong> and <strong>Ollama</strong> (running the minimax-m2.7 model), the agent understands your needs and assists with creating, updating, and deleting listings.
				</p>

				<p class="text-purple-200/80 leading-relaxed mb-4">
					Simply tell the AI what you need — whether it's creating a new listing for a product or service, updating existing details, or removing a listing — and the agent handles the technical work for you.
				</p>

				<h3 class="font-['Space_Grotesk'] text-lg font-bold text-white mt-6 mb-3">Key Capabilities</h3>
				<ul class="text-purple-200/80 leading-relaxed space-y-2 mb-4">
					<li><strong class="text-pink-400">Smart Creation</strong> — Describe your product or service in plain language, and the AI automatically improves your description to make it more appealing and grammatically correct.</li>
					<li><strong class="text-pink-400">Category Detection</strong> — The AI intelligently categorizes your listing (products, services, real estate, vehicles, electronics, home, fashion, sports, education, etc.).</li>
					<li><strong class="text-pink-400">Price Suggestions</strong> — The agent helps identify and set appropriate pricing for your offerings.</li>
					<li><strong class="text-pink-400">Location Validation</strong> — Using the <strong>Nominatim API</strong> (OpenStreetMap), the AI validates and enriches addresses with accurate city, state, postal code, and coordinates.</li>
					<li><strong class="text-pink-400">Full CRUD Operations</strong> — Create, view, update, and delete your listings all through conversational AI.</li>
					<li><strong class="text-pink-400">Listing Periods</strong> — Define start and end dates for time-sensitive listings.</li>
				</ul>

				<p class="text-purple-200/80 leading-relaxed mb-4">
					All listings are stored in a structured database with fields for title, description, category, amount, currency, location details, and timing — giving you a complete view of your business offerings.
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