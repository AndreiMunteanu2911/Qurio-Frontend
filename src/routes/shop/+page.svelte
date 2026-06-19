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
		border_glow_violet: '0 0 0 3px #6849ff, 0 0 22px rgb(104 73 255 / 0.75)',
		border_double_ring: '0 0 0 2px #090318, 0 0 0 5px #6849ff, 0 0 0 8px #69eff7',
		border_dashed_cyan: '2px dashed #69eff7',
		border_starburst: '0 0 0 2px #090318, 0 0 0 5px #69eff7, 0 0 28px rgb(105 239 247 / 0.65)',
		border_lime_pulse: '0 0 0 4px #b6ff2e, 0 0 24px rgb(182 255 46 / 0.65)',
		border_inferno: '0 0 0 4px #ff3045, 0 0 26px rgb(255 138 0 / 0.7)',
		border_prism: '0 0 0 3px #ff3f8e, 0 0 0 6px #7dd3fc, 0 0 0 9px #b6ff2e',
		border_ice_shard: '0 0 0 3px #dff7ff, 0 0 0 6px #2f80ff, 0 0 24px rgb(125 211 252 / 0.72)',
	};

	const SKIN_PREVIEW: Record<string, { label: string; css: Record<string, string> }> = {
		skin_minimal: { label: 'Minimal', css: { border: '1px solid rgb(255 255 255 / 0.18)', background: 'rgb(255 255 255 / 0.025)' } },
		skin_gradient: { label: 'Gradient', css: { border: '1px solid rgb(255 255 255 / 0.12)', background: 'linear-gradient(135deg, rgb(104 73 255 / 0.32), rgb(105 239 247 / 0.14)), #130a2b', boxShadow: '0 10px 26px rgb(104 73 255 / 0.22)' } },
		skin_neon: { label: 'Neon', css: { border: '1px solid rgb(105 239 247 / 0.28)', boxShadow: '0 0 22px rgb(104 73 255 / 0.36), 0 0 10px rgb(105 239 247 / 0.2)', background: '#100624' } },
		skin_glass: { label: 'Glass', css: { background: 'linear-gradient(145deg, rgb(255 255 255 / 0.13), rgb(255 255 255 / 0.035))', backdropFilter: 'blur(18px)', border: '1px solid rgb(255 255 255 / 0.22)' } },
		skin_classic: { label: 'Classic', css: { background: '#130a2b' } },
		skin_terminal: { label: 'Terminal', css: { background: '#030b08', border: '1px solid rgb(86 255 146 / 0.28)', boxShadow: 'inset 4px 0 0 #56ff92, 0 0 18px rgb(86 255 146 / 0.12)' } },
		skin_hologram: { label: 'Hologram', css: { background: 'linear-gradient(120deg, rgb(125 211 252 / 0.2), rgb(217 70 239 / 0.18), rgb(182 255 46 / 0.1)), #100624', border: '1px solid rgb(255 255 255 / 0.24)', boxShadow: '0 0 24px rgb(125 211 252 / 0.16)' } },
		skin_paper: { label: 'Paper', css: { background: 'linear-gradient(145deg, #3a2818, #20130c)', border: '1px solid #c8ad7f', boxShadow: '0 8px 18px rgb(0 0 0 / 0.22)' } },
		skin_obsidian: { label: 'Obsidian', css: { background: 'linear-gradient(145deg, #080506, #160709 55%, #050101)', border: '1px solid rgb(255 48 69 / 0.35)', boxShadow: '0 0 26px rgb(255 48 69 / 0.16)' } },
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
						<div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl font-black text-white">U</div>
						<p class="text-sm font-bold" style="color: var(--accent);">{item.name.replace('Title: ', '')}</p>
						<p class="text-sm text-white/80">Username</p>
					</div>

				{:else if borderPreview}
					<div class="flex flex-col items-center gap-3">
						<div class="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-3xl font-black text-white"
							style="box-shadow: {borderPreview};">
							U
						</div>
					</div>

				{:else if skinPreview}
					{@const skinCss = Object.entries(skinPreview.css).map(([k, v]) => `${k}:${v}`).join(';')}
					<div class="w-full max-w-xs">
						<div class="rounded-xl p-4 text-center" style={skinCss}>
							<p class="text-sm font-black text-white">{skinPreview.label} card</p>
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

		{#snippet footer()}
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
		{/snippet}
	{/if}
</ModalWrapper>
