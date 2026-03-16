<script lang="ts">
	let { data } = $props();
	const verified = $derived(data.emailVerified);
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
		{#if verified}
			<div class="text-green-500 text-6xl mb-4">✓</div>
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
			<p class="text-gray-600 mb-6">Your email has been successfully verified. You can now sign in.</p>
			<a
				href="/demo/better-auth"
				class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
			>
				Sign In
			</a>
		{:else}
			<div class="text-red-500 text-6xl mb-4">✗</div>
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
			<p class="text-gray-600 mb-6">The verification link is invalid or has expired.</p>
			<a
				href="/demo/better-auth"
				class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
			>
				Back to Login
			</a>
		{/if}
	</div>
</div>