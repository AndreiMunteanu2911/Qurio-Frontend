<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import ModalWrapper from '$lib/components/ModalWrapper.svelte';
	import Button from '$lib/components/Button.svelte';
	import { getCurrency, getInventory, purchaseItem, equipCosmetic } from '$lib/api';
	import { SHOP_ITEMS, SHOP_CATEGORIES, type ShopCategory } from '$lib/shop';
	import { badgeRefresh } from '$lib/refresh';
	import { pushToast } from '$lib/toasts';
	import type { CurrencyData, InventoryData, ShopItem } from '$lib/types';
	import {
		IconCoin, IconBolt, IconDroplet, IconBadge, IconLayout, IconCircle, IconPalette,
		IconCheck, IconShoppingBag, IconX
	} from '@tabler/icons-svelte';

	let currency = $state<CurrencyData | null>(null);
	let inventory = $state<InventoryData | null>(null);
	let loading = $state(true);
	let category = $state<ShopCategory>('all');
	let purchasing = $state<string | null>(null);
	let selectedItem = $state<ShopItem | null>(null);

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

	const ACCENT_COLORS: Record<string, { color: string; bg: string }> = {
		accent_gold: { color: '#ffd23f', bg: 'rgb(255 210 63 / 0.18)' },
		accent_rose: { color: '#ff3f8e', bg: 'rgb(255 63 142 / 0.18)' },
		accent_emerald: { color: '#12e08a', bg: 'rgb(18 224 138 / 0.18)' },
		accent_sapphire: { color: '#2f80ff', bg: 'rgb(47 128 255 / 0.18)' },
		accent_amber: { color: '#ff8a00', bg: 'rgb(255 138 0 / 0.18)' },
		accent_crimson: { color: '#ff3045', bg: 'rgb(255 48 69 / 0.2)' },
		accent_lime: { color: '#b6ff2e', bg: 'rgb(182 255 46 / 0.18)' },
		accent_orchid: { color: '#d946ef', bg: 'rgb(217 70 239 / 0.2)' },
		accent_ice: { color: '#7dd3fc', bg: 'rgb(125 211 252 / 0.2)' },
	};

	const THEME_BGS: Record<string, string> = {
		theme_midnight: 'radial-gradient(circle at top, #1d2b7a 0%, #080b2a 55%, #030513 100%)',
		theme_sunset: 'linear-gradient(145deg, #4b102b 0%, #9a3412 52%, #321018 100%)',
		theme_forest: 'linear-gradient(145deg, #062b18 0%, #064e3b 48%, #02130b 100%)',
		theme_ocean: 'linear-gradient(145deg, #06283d 0%, #075985 48%, #03111c 100%)',
		theme_galaxy: 'radial-gradient(circle at 20% 10%, #7c3aed 0%, #1d0b42 42%, #05020f 100%)',
		theme_inferno: 'radial-gradient(circle at top right, #ff3b1f 0%, #4a0909 46%, #050101 100%)',
		theme_arctic: 'linear-gradient(145deg, #dff7ff 0%, #2f80ff 42%, #07192f 100%)',
		theme_aurora: 'linear-gradient(135deg, #042f2e 0%, #22c55e 35%, #7c3aed 72%, #0b061b 100%)',
		theme_royal: 'linear-gradient(145deg, #2e1065 0%, #6d28d9 45%, #f59e0b 120%)',
	};

	const BORDER_PREVIEW: Record<string, string> = {
		border_thin_gold: '2px solid #ffc800',
		border_glow_violet: '0 0 0 4px #6849ff, 0 0 18px rgb(104 73 255 / 0.45)',
		border_double_ring: '0 0 0 3px #ffffff, 0 0 0 6px #6849ff, 0 0 0 9px #2f80ff',
		border_dashed_cyan: '3px dashed #2f80ff',
		border_starburst: '0 0 0 3px #ffffff, 0 0 0 6px #2f80ff, 0 0 24px rgb(47 128 255 / 0.45)',
		border_lime_pulse: '0 0 0 4px #9be12a, 0 0 18px rgb(155 225 42 / 0.45)',
		border_inferno: '0 0 0 4px #ff5a6b, 0 0 20px rgb(255 90 107 / 0.4)',
		border_prism: '0 0 0 3px #ff3f8e, 0 0 0 6px #7dd3fc, 0 0 0 9px #b6ff2e',
		border_ice_shard: '0 0 0 3px #dff7ff, 0 0 0 6px #2f80ff, 0 0 20px rgb(47 128 255 / 0.42)',
	};

	const SKIN_PREVIEW: Record<string, { label: string; css: Record<string, string> }> = {
		skin_minimal: { label: 'Minimal', css: { border: '2px solid #cfc5ed', background: '#ffffff', boxShadow: '0 6px 0 #e5ddfa' } },
		skin_gradient: { label: 'Gradient', css: { border: '2px solid #9f86ff', background: 'linear-gradient(135deg, #ffffff, #eee8ff 52%, #e6f2ff)', boxShadow: '0 7px 0 #b8a9ff' } },
		skin_neon: { label: 'Neon', css: { border: '2px solid #2f80ff', background: 'linear-gradient(145deg, #ffffff, #e8f2ff)', boxShadow: '0 7px 0 #9cc7ff, 0 0 20px rgb(47 128 255 / 0.28)' } },
		skin_glass: { label: 'Glass', css: { background: 'rgb(255 255 255 / 0.7)', backdropFilter: 'blur(16px)', border: '2px solid rgb(255 255 255 / 0.95)', boxShadow: '0 7px 0 rgb(216 207 255 / 0.72)' } },
		skin_classic: { label: 'Classic', css: { border: '2px solid #d7caff', background: '#ffffff', boxShadow: '0 7px 0 #d8cfff' } },
		skin_terminal: { label: 'Terminal', css: { background: 'linear-gradient(145deg, #fbffff, #e8fff5)', border: '2px solid #55d99c', boxShadow: '0 7px 0 #9de6c5' } },
		skin_hologram: { label: 'Hologram', css: { background: 'linear-gradient(135deg, #ffffff, #efe8ff 35%, #e6f4ff 70%, #fff7cf)', border: '2px solid #9f86ff', boxShadow: '0 7px 0 #d8cfff, 0 0 20px rgb(125 211 252 / 0.22)' } },
		skin_paper: { label: 'Paper', css: { background: 'linear-gradient(145deg, #fffdf7, #f3edff)', border: '2px solid #c5afea', boxShadow: '0 7px 0 #ded2ff' } },
		skin_obsidian: { label: 'Obsidian', css: { background: 'linear-gradient(145deg, #ffffff, #f2efff)', border: '2px solid #6849ff', boxShadow: '0 7px 0 #7f65ec' } },
	};

	const accentPreview = $derived(selectedItem && selectedItem.type === 'accent' && ACCENT_COLORS[selectedItem.id] ? ACCENT_COLORS[selectedItem.id] : null);
	const themePreview = $derived(selectedItem && selectedItem.type === 'exam-theme' && THEME_BGS[selectedItem.id] ? THEME_BGS[selectedItem.id] : null);
	const borderPreview = $derived(selectedItem && selectedItem.type === 'avatar-border' && BORDER_PREVIEW[selectedItem.id] ? BORDER_PREVIEW[selectedItem.id] : null);
	const skinPreview = $derived(selectedItem && selectedItem.type === 'card-skin' && SKIN_PREVIEW[selectedItem.id] ? SKIN_PREVIEW[selectedItem.id] : null);
	const isTitle = $derived(selectedItem?.type === 'title');
	const isPowerUp = $derived(selectedItem?.type === 'power-up');

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
			badgeRefresh.update(n => n + 1);
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Purchase failed.', 'error');
		}
		finally { purchasing = null; }
	}

	async function handleEquip(itemId: string, slot: string) {
		try {
			const result = await equipCosmetic(itemId, slot);
			inventory = { ...inventory!, activeCosmetics: result.activeCosmetics };
			badgeRefresh.update(n => n + 1);
			pushToast('Item equipped!', 'success');
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Failed to equip.', 'error');
		}
	}

	async function handleUnequip(slot: string) {
		try {
			const result = await equipCosmetic(null, slot);
			inventory = { ...inventory!, activeCosmetics: result.activeCosmetics };
			badgeRefresh.update(n => n + 1);
		} catch { /* ok */ }
	}

	function closeModal() {
		selectedItem = null;
	}

	async function modalAction() {
		if (!selectedItem || !inventory) return;
		const item = selectedItem;
		const slot = slotForItem(item.type);
		const owned = ownedSet.has(item.id);

		if (!owned) {
			await handlePurchase(item.id);
		} else if (slot) {
			const equipped = slot ? equippedInSlot(slot) === item.id : false;
			if (equipped) {
				await handleUnequip(slot);
			} else {
				await handleEquip(item.id, slot);
			}
		}
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
				<button
					class="card-sm flex cursor-pointer flex-col text-left transition-transform active:translate-y-px"
					style="border: 1px solid {equipped ? 'var(--cyan)' : 'var(--border)'};"
					onclick={() => (selectedItem = item)}
				>
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
								<span class="rounded-lg px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wide"
									style="background: {equipped ? 'var(--surface-3)' : 'var(--cyan-soft)'}; color: {equipped ? 'var(--text-muted)' : 'var(--cyan)'};"
								>
									{equipped ? 'Equipped' : 'Owned'}
								</span>
							{/if}
						{:else}
							<span class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.65rem] font-black uppercase tracking-wide"
								style="background: var(--violet-soft); color: var(--violet);"
							>
								{item.cost}
								<IconCoin size={11} stroke-width={2} />
							</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</section>
{/if}

<ModalWrapper open={selectedItem !== null} title={selectedItem?.name ?? ''} onClose={closeModal}>
	{#if selectedItem}
		{@const item = selectedItem}
		{@const Icon = typeIcon(item.type)}
		{@const owned = ownedSet.has(item.id)}
		{@const qty = ownedQuantities.get(item.id) ?? 0}
		{@const slot = slotForItem(item.type)}
		{@const equipped = slot ? equippedInSlot(slot) === item.id : false}
		{@const canAfford = (currency?.balance ?? 0) >= item.cost}

		<!-- Preview section for cosmetics -->
		{#if !isPowerUp}
			<div in:fly={{ y: 8, duration: 150 }} class="mb-4 flex justify-center">
				{#if accentPreview}
					<div class="flex flex-col items-center gap-3">
						<div class="h-16 w-16 rounded-full" style="background: {accentPreview.color}; box-shadow: 0 0 24px {accentPreview.color}40;"></div>
						<div class="flex items-center gap-2 rounded-lg px-3 py-1.5" style="background: {accentPreview.bg};">
							<span class="text-xs font-bold uppercase tracking-wide" style="color: {accentPreview.color};">{item.name}</span>
						</div>
						<div class="mt-1 flex gap-2">
							<div class="h-8 w-12 rounded-md" style="background: {accentPreview.color};"></div>
							<div class="h-8 w-12 rounded-md" style="background: {accentPreview.bg}; border: 1px solid {accentPreview.color};"></div>
						</div>
					</div>

				{:else if isTitle}
					<div class="flex flex-col items-center gap-2 text-center">
						<div class="flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl font-black" style="background: var(--surface-2); border-color: var(--border); color: var(--text);">U</div>
						<p class="text-sm font-bold" style="color: var(--accent);">{item.name.replace('Title: ', '')}</p>
						<p class="text-sm" style="color: var(--text-muted);">Username</p>
					</div>

				{:else if borderPreview}
					<div class="flex flex-col items-center gap-3">
						<div class="flex h-20 w-20 items-center justify-center rounded-full border-2 text-3xl font-black"
							style="background: var(--surface-2); border-color: var(--border); color: var(--text); box-shadow: {borderPreview};">
							U
						</div>
					</div>

				{:else if skinPreview}
					{@const skinCss = Object.entries(skinPreview.css).map(([k, v]) => `${k}:${v}`).join(';')}
					<div class="w-full max-w-xs">
						<div class="rounded-xl p-4 text-center" style={skinCss}>
							<p class="text-sm font-black" style="color: var(--text);">{skinPreview.label} card</p>
							<p class="mt-1 text-xs" style="color: var(--text-muted);">Preview of how cards will look.</p>
						</div>
					</div>

				{:else if themePreview}
					<div class="flex w-full max-w-xs flex-col items-center gap-2 rounded-xl p-4" style="background: {themePreview};">
						<p class="text-sm font-black text-white">{item.name}</p>
						<p class="text-xs" style="color: var(--text-muted);">Exam background preview</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Item info -->
		<div class="flex items-start gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style="background: rgb(255 255 255 / 0.06);">
				<Icon size={18} stroke-width={2} style="color: var(--accent);" />
			</div>
			<div>
				<p class="text-sm font-black text-white">{item.name}</p>
				<p class="text-[0.6rem] font-bold uppercase tracking-wide" style="color: var(--text-muted);">{typeLabel(item.type)}</p>
				<p class="mt-2 text-xs leading-relaxed" style="color: var(--text-muted);">{item.description}</p>
				{#if owned && item.consumable}
					<p class="mt-1 text-xs font-bold" style="color: var(--text-muted);">Quantity: {qty}</p>
				{/if}
			</div>
		</div>

		<div class="mt-5 flex flex-col gap-2 sm:flex-row">
			<Button variant="ghost" class="flex-1" onclick={closeModal}>Close</Button>
			{#if !owned}
				<Button class="flex-1" disabled={purchasing === item.id || !canAfford} onclick={() => modalAction()}>
					{purchasing === item.id ? '...' : `Buy for ${item.cost}`}
					<IconCoin size={13} stroke-width={2} />
				</Button>
			{:else if slot}
				<Button class="flex-1" variant={equipped ? 'secondary' : 'primary'} onclick={modalAction}>
					{equipped ? 'Unequip' : 'Equip'}
				</Button>
			{:else}
				<Button class="flex-1" variant="secondary" onclick={closeModal}>Owned</Button>
			{/if}
		</div>
	{/if}
</ModalWrapper>
