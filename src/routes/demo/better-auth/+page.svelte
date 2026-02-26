<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 font-['Inter']">
	<main class="max-w-2xl mx-auto px-6 py-20">
		<div class="text-center space-y-8">
			<h1 class="font-['Space_Grotesk'] text-5xl md:text-6xl font-bold text-white tracking-tight">
				Welcome <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">{data.user.name}</span>
			</h1>
			<p class="text-xl text-purple-200 max-w-xl mx-auto leading-relaxed">
				You're now logged in and can access protected content.
			</p>

			<div class="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 mt-8">
				<p class="text-purple-300 text-sm mb-2">User ID</p>
				<p class="text-white font-mono text-sm break-all">{data.user.id}</p>
			</div>

			<form method="post" action="?/signOut" use:enhance>
				<button class="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-1"
					>Sign out</button
				>
			</form>
		</div>

		<p class="text-center mt-12">
			<a href="/demo" class="text-purple-400 hover:text-pink-400 transition-colors">
				&larr; Back to Demo
			</a>
		</p>
	</main>
</div>
