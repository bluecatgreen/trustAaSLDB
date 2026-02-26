<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 font-['Inter']">
	<main class="max-w-4xl mx-auto px-6 py-20">
		<div class="text-center space-y-8">
			<!-- Logo -->
			<div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl mb-4">
				<svg class="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
			</div>

			<h1 class="font-['Space_Grotesk'] text-5xl md:text-6xl font-bold text-white tracking-tight">
				Demo <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">Pages</span>
			</h1>
			<p class="text-xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
				Explore the different features and functionalities of this SvelteKit application.
			</p>
		</div>

		<div class="mt-16 grid md:grid-cols-1 gap-6 max-w-xl mx-auto">
			<a
				href={resolve('/demo/better-auth')}
				class="group bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 flex items-center justify-between"
			>
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
						<svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
					</div>
					<div class="text-left">
						<h3 class="text-lg font-semibold text-white group-hover:text-pink-400 transition-colors">Better Auth</h3>
						<p class="text-purple-300">User authentication demo with login and registration</p>
					</div>
				</div>
				<svg class="w-5 h-5 text-white/40 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</a>
		</div>

		<div class="text-center mt-12">
			<a
				href="/"
				class="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Back to Home
			</a>
		</div>
	</main>
</div>
