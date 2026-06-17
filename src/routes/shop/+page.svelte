<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import { getCurrency, getInventory, purchaseItem, equipCosmetic } from '$lib/api';
	import { SHOP_ITEMS, SHOP_CATEGORIES, type ShopCategory } from '$lib/shop';
	import { pushToast } from '$lib/toasts';
	import type { CurrencyData, InventoryData } from '$lib/types';
	import {
		IconCoin, IconBolt, IconDroplet, IconBadge, IconLayout, IconCircle, IconPalette,
		IconCheck, IconShoppingBag
	} from '@tabler/icons-svelte';

	let currency = $state<CurrencyData | null>(null);
	let inventory = $state<InventoryData | null>(null);
	let loading = $state(true);
	let category = $state<ShopCategory>('all');
	let purchasing = $state<string | null>(null);

	const filtered = $derived(
		category === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.type === category)
	);

	const ownedSet = $derived(new Set(inventory?.items.map((i) => i.itemId) ?? []));
	const ownedQuantities = $derived(
		new Map(inventory?.items.map((i) => [i.itemId, i.quantity]) ?? [])
	);
	const activeCosmetics = $derived(inventory?.activeCosmetics ?? {});

	const equippedInSlot = (slot: string) => activeCosmetics[slot] ?? null;

	function slotForItem(type: string): string | null {
		if (type === 'accent') return 'accent';
		if (type === 'title') return 'title';
		if (type === 'card-skin') return 'cardSkin';
		if (type === 'avatar-border') return 'avatarBorder';
		if (type === 'exam-theme') return 'examTheme';
		return null;
	}

	function typeLabel(type: string) {
		return SHOP_CATEGORIES.find((c) => c.id === type)?.label ?? type;
	}

	function typeIcon(type: string) {
		switch (type) {
			case 'power-up': return IconBolt;
			case 'accent': return IconDroplet;
			case 'title': return IconBadge;
			case 'card-skin': return IconLayout;
			case 'avatar-border': return IconCircle;
			case 'exam-theme': return IconPalette;
			default: return IconShoppingBag;
		}
	}

	onMount(async () => {
		try {
			const [c, inv] = await Promise.all([getCurrency(), getInventory()]);
			currency = c;
			inventory = inv;
		} catch { /* ok */ }
		finally { loading = false; }
	});

	async function handlePurchase(itemId: string) {
		purchasing = itemId;
		try {
			const result = await purchaseItem(itemId);
			currency = { balance: result.balance };
			inventory = await getInventory();
			pushToast('Item purchased!', 'success');
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Purchase failed.', 'error');
		}
		finally { purchasing = null; }
	}

	async function handleEquip(itemId: string, slot: string) {
		try {
			const result = await equipCosmetic(itemId, slot);
			inventory = { ...inventory!, activeCosmetics: result.activeCosmetics };
			pushToast('Item equipped!', 'success');
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Failed to equip.', 'error');
		}
	}

	async function handleUnequip(slot: string) {
		try {
			const result = await equipCosmetic(null, slot);
			inventory = { ...inventory!, activeCosmetics: result.activeCosmetics };
		} catch { /* ok */ }
	}
</script>

<svelte:head><title>Shop — Qurio</title></svelte:head>

{#if loading}
	<LoadingCard label="Loading shop..." />
{:else}
	<section class="page-stack">
		<div class="card-accent violet">
			<p class="eyebrow">Shop</p>
			<div class="flex items-center justify-between">
				<h1 class="mt-1.5 text-2xl font-black leading-tight text-white sm:text-3xl">Spend your coins</h1>
				<div class="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1.5 text-sm font-black text-yellow-400">
					<IconCoin size={16} stroke-width={2} />
					{currency?.balance ?? 0}
				</div>
			</div>
		</div>

		<div class="flex flex-wrap gap-1.5">
			{#each SHOP_CATEGORIES as cat}
				<button
					class={['tag pressable', category === cat.id ? 'tag-cyan' : 'tag-surface']}
					onclick={() => (category = cat.id)}
				>{cat.label}</button>
			{/each}
		</div>

		<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as item}
				{@const Icon = typeIcon(item.type)}
				{@const owned = ownedSet.has(item.id)}
				{@const qty = ownedQuantities.get(item.id) ?? 0}
				{@const slot = slotForItem(item.type)}
				{@const equipped = slot ? equippedInSlot(slot) === item.id : false}
				<div class="card-sm flex flex-col" style="border: 1px solid {equipped ? 'var(--cyan)' : 'var(--border)'};">
					<div class="flex items-start justify-between">
						<div class="flex items-center gap-2">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background: rgb(255 255 255 / 0.06);">
								<Icon size={16} stroke-width={2} style="color: var(--accent);" />
							</div>
							<div>
								<p class="text-sm font-black text-white">{item.name}</p>
								<p class="text-[0.6rem] font-bold uppercase tracking-wide" style="color: var(--text-muted);">{typeLabel(item.type)}</p>
							</div>
						</div>
						{#if owned && !item.consumable}
							<div class="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20">
								<IconCheck size={14} stroke-width={3} style="color: var(--cyan);" />
							</div>
						{/if}
					</div>
					<p class="mt-2 text-[0.7rem] leading-relaxed" style="color: var(--text-muted);">{item.description}</p>
					<div class="mt-3 flex items-center gap-1.5">
						{#if owned && item.consumable}
							<span class="text-xs font-bold" style="color: var(--text-muted);">Owned: {qty}</span>
						{:else if owned && !item.consumable}
							{#if slot}
								<button
									class="pressable rounded-lg px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wide"
									style="background: {equipped ? 'var(--surface-3)' : 'var(--cyan-soft)'}; color: {equipped ? 'var(--text-muted)' : 'var(--cyan)'};"
									onclick={() => equipped ? handleUnequip(slot!) : handleEquip(item.id, slot!)}
								>
									{equipped ? 'Equipped' : 'Equip'}
								</button>
							{/if}
						{:else}
							<button
								class="pressable inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.65rem] font-black uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-40"
								style="background: var(--violet-soft); color: var(--violet);"
								disabled={purchasing === item.id || (currency?.balance ?? 0) < item.cost}
								onclick={() => handlePurchase(item.id)}
							>
								{purchasing === item.id ? '...' : `${item.cost}`}
								<IconCoin size={11} stroke-width={2} />
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}
