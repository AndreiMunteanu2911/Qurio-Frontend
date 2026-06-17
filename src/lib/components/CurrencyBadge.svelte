<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrency } from '$lib/api';
	import { IconCoin } from '@tabler/icons-svelte';

	let balance = $state(0);
	let loading = $state(true);

	onMount(async () => {
		try {
			const data = await getCurrency();
			balance = data.balance;
		} catch { /* ok */ }
		finally { loading = false; }
	});
</script>

<div class="currency-badge">
	<IconCoin size={14} stroke-width={2} />
	<span class="balance">{loading ? '...' : balance}</span>
</div>

<style>
	.currency-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
		background: rgb(255 200 0 / 0.1);
		color: #ffc800;
		font-size: 0.75rem;
		font-weight: 850;
		line-height: 1;
	}
	.balance {
		min-width: 1.2rem;
		text-align: center;
	}
</style>
