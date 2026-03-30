<script lang="ts">
	interface ValidatedAddress {
		displayName: string;
		street: string;
		houseNumber: string;
		city: string;
		state: string;
		postalCode: string;
		country: string;
		countryCode: string;
		lat: string;
		lon: string;
	}

	interface Props {
		businessAddress: string;
		label?: string;
	}

	let { businessAddress = $bindable(''), label = 'Business Address' }: Props = $props();

	let isValidating = $state(false);
	let validatedAddress = $state<ValidatedAddress | null>(null);
	let validationError = $state('');
	let showValidation = $state(false);

	// Editable fields for the validated address
	let editStreet = $state('');
	let editHouseNumber = $state('');
	let editCity = $state('');
	let editState = $state('');
	let editPostalCode = $state('');
	let editCountry = $state('');

	async function validateAddress() {
		if (!businessAddress.trim()) {
			validationError = 'Please enter an address first';
			return;
		}

		isValidating = true;
		validationError = '';
		validatedAddress = null;

		try {
			const response = await fetch('/api/validate-address', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ address: businessAddress })
			});

			const data = await response.json();

			if (data.success && data.address) {
				const address = data.address;
				validatedAddress = address;
				showValidation = true;
				// Pre-populate editable fields
				editStreet = address.street;
				editHouseNumber = address.houseNumber;
				editCity = address.city;
				editState = address.state;
				editPostalCode = address.postalCode;
				editCountry = address.country;
			} else {
				validationError = data.error || 'Failed to validate address';
			}
		} catch (error) {
			validationError = 'Failed to validate address. Please try again.';
		} finally {
			isValidating = false;
		}
	}

	function revalidateFromEdit() {
		// Build address from edited fields
		const parts = [];
		if (editHouseNumber) parts.push(editHouseNumber);
		if (editStreet) parts.push(editStreet);
		if (editCity) parts.push(editCity);
		if (editState) parts.push(editState);
		if (editPostalCode) parts.push(editPostalCode);
		if (editCountry) parts.push(editCountry);

		businessAddress = parts.join(', ');
		validateAddress();
	}

	function acceptValidated() {
		// Build the formatted address from validated/edited components
		const parts = [];
		if (editHouseNumber) parts.push(editHouseNumber);
		if (editStreet) parts.push(editStreet);
		if (editCity) parts.push(editCity);
		if (editState) parts.push(editState);
		if (editPostalCode) parts.push(editPostalCode);
		if (editCountry) parts.push(editCountry);

		businessAddress = parts.join(', ');
		showValidation = false;
		validatedAddress = null;
	}

	function skipValidation() {
		showValidation = false;
		validatedAddress = null;
		validationError = '';
	}
</script>

<div class="space-y-3">
	{#if !showValidation}
		<div>
			<label class="block text-sm font-medium text-purple-200 mb-2">{label}</label>
			<textarea
				bind:value={businessAddress}
				rows="2"
				class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 focus:outline-none transition-all resize-none"
				placeholder="Full business address"
			></textarea>
		</div>
		{#if businessAddress.trim()}
			<button
				type="button"
				onclick={validateAddress}
				disabled={isValidating}
				class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
			>
				{#if isValidating}
					<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Validating...
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Validate Address
				{/if}
			</button>
		{/if}
	{:else}
		<div class="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3">
			<div class="flex items-center gap-2 text-green-400">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				<span class="font-medium">Address Validated</span>
			</div>

			{#if validatedAddress?.displayName}
				<p class="text-sm text-green-300/70 break-words">{validatedAddress.displayName}</p>
			{/if}

			<div class="grid grid-cols-2 gap-3 mt-3">
				<div>
					<label class="block text-xs text-purple-200/70 mb-1">House Number</label>
					<input
						type="text"
						bind:value={editHouseNumber}
						class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 focus:outline-none"
					/>
				</div>
				<div>
					<label class="block text-xs text-purple-200/70 mb-1">Street</label>
					<input
						type="text"
						bind:value={editStreet}
						class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 focus:outline-none"
					/>
				</div>
				<div>
					<label class="block text-xs text-purple-200/70 mb-1">City</label>
					<input
						type="text"
						bind:value={editCity}
						class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 focus:outline-none"
					/>
				</div>
				<div>
					<label class="block text-xs text-purple-200/70 mb-1">State/Province</label>
					<input
						type="text"
						bind:value={editState}
						class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 focus:outline-none"
					/>
				</div>
				<div>
					<label class="block text-xs text-purple-200/70 mb-1">Postal Code</label>
					<input
						type="text"
						bind:value={editPostalCode}
						class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 focus:outline-none"
					/>
				</div>
				<div>
					<label class="block text-xs text-purple-200/70 mb-1">Country</label>
					<input
						type="text"
						bind:value={editCountry}
						class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 focus:outline-none"
					/>
				</div>
			</div>

			<div class="flex gap-2 mt-3">
				<button
					type="button"
					onclick={acceptValidated}
					class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
				>
					Accept & Continue
				</button>
				<button
					type="button"
					onclick={revalidateFromEdit}
					disabled={isValidating}
					class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white text-sm font-medium rounded-lg transition-colors"
				>
					Re-validate
				</button>
				<button
					type="button"
					onclick={skipValidation}
					class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
				>
					Skip
				</button>
			</div>
		</div>
	{/if}

	{#if validationError}
		<p class="text-red-400 text-sm">{validationError}</p>
	{/if}
</div>