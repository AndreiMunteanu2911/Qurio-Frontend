<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import { getInventory, equipCosmetic } from '$lib/api';
	import { SHOP_ITEMS } from '$lib/shop';
	import { pushToast } from '$lib/toasts';
	import { IconArrowLeft, IconCheck } from '@tabler/icons-svelte';
	import type { InventoryData } from '$lib/types';

	let loading = $state(true);
	let inventory = $state<InventoryData | null>(null);
	let selectedSlot = $state<string | null>(null);

	const SLOTS = [
		{ key: 'accent', label: 'Accent Color', type: 'accent' },
		{ key: 'title', label: 'Profile Title', type: 'title' },
		{ key: 'cardSkin', label: 'Card Skin', type: 'card-skin' },
		{ key: 'avatarBorder', label: 'Avatar Border', type: 'avatar-border' },
		{ key: 'examTheme', label: 'Exam Theme', type: 'exam-theme' },
	] as const;

	const ownedBySlot = $derived(() => {
		const map: Record<string, typeof SHOP_ITEMS> = {};
		for (const slot of SLOTS) {
			map[slot.key] = SHOP_ITEMS.filter(
				(item) => item.type === slot.type && (inventory?.items ?? []).some((i) => i.itemId === item.id)
			);
		}
		return map;
	});

	const activeCosmetics = $derived(inventory?.activeCosmetics ?? {});
	const selectedItems = $derived(selectedSlot ? ownedBySlot()[selectedSlot] ?? [] : []);
	const equippedInSlot = $derived((slot: string) => activeCosmetics[slot] ?? null);

	const ACCENT_COLORS: Record<string, { color: string; bg: string }> = {
		accent_gold: { color: '#ffc800', bg: 'rgb(255 200 0 / 0.1)' },
		accent_rose: { color: '#ff6b9d', bg: 'rgb(255 107 157 / 0.1)' },
		accent_emerald: { color: '#34d399', bg: 'rgb(52 211 153 / 0.1)' },
		accent_sapphire: { color: '#60a5fa', bg: 'rgb(96 165 250 / 0.1)' },
		accent_amber: { color: '#fbbf24', bg: 'rgb(251 191 36 / 0.1)' },
	};

	const THEME_BGS: Record<string, string> = {
		theme_midnight: '#0c1445',
		theme_sunset: '#2d1b2e',
		theme_forest: '#0a1f14',
		theme_ocean: '#0a1f2e',
		theme_galaxy: '#0e0820',
	};

	const BORDER_PREVIEW: Record<string, string> = {
		border_thin_gold: '2px solid #ffc800',
		border_glow_violet: '0 0 12px rgb(104 73 255 / 0.6)',
		border_double_ring: '0 0 0 2px #090318, 0 0 0 4px #6849ff',
		border_dashed_cyan: '2px dashed #69eff7',
		border_starburst: '0 0 0 2px #090318, 0 0 0 4px #69eff7, 0 0 16px rgb(105 239 247 / 0.4)',
	};

	const SKIN_PREVIEW: Record<string, Record<string, string>> = {
		skin_minimal: { border: '1px solid rgb(255 255 255 / 0.04)', background: 'transparent' },
		skin_gradient: { border: '1px solid transparent', background: 'linear-gradient(135deg, #6849ff, #69eff7) padding-box, linear-gradient(135deg, #6849ff, #69eff7) border-box' },
		skin_neon: { boxShadow: '0 0 12px rgb(104 73 255 / 0.2), 0 0 4px rgb(105 239 247 / 0.1)', background: '#130a2b' },
		skin_glass: { background: 'rgb(19 10 43 / 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgb(255 255 255 / 0.06)' },
		skin_classic: { background: '#130a2b' },
	};

	onMount(async () => {
		try {
			inventory = await getInventory();
		} catch { /* ok */ }
		finally { loading = false; }
	});

	async function handleEquip(itemId: string, slot: string) {
		try {
			const result = await equipCosmetic(itemId, slot);
			inventory = { ...inventory!, activeCosmetics: result.activeCosmetics };
			pushToast('Equipped!', 'success');
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

<svelte:head><title>Customize — Qurio</title></svelte:head>

{#if loading}
	<LoadingCard label="Loading..." />
{:else if inventory}
	<section class="page-stack">
		<div class="card-accent violet">
			<div class="flex items-center gap-3">
				<button class="pressable" onclick={() => goto('/profile')}>
					<IconArrowLeft size={18} stroke-width={2} style="color: var(--text-muted);" />
				</button>
				<div>
					<p class="eyebrow">Customize</p>
					<h1 class="mt-0.5 text-2xl font-black leading-tight text-white">Your cosmetics</h1>
				</div>
			</div>
		</div>

		{#if selectedSlot === null}
			<!-- Slot selection -->
			<div class="grid gap-2 sm:grid-cols-2">
				{#each SLOTS as slot}
					{@const equipped = equippedInSlot(slot.key)}
					{@const equippedName = equipped ? SHOP_ITEMS.find((i) => i.id === equipped)?.name ?? 'Unknown' : null}
					<button
						class="card-sm flex cursor-pointer items-center gap-3 text-left transition-transform active:translate-y-px"
						style="border: 1px solid {equipped ? 'var(--cyan)' : 'var(--border)'};"
						onclick={() => (selectedSlot = slot.key)}
					>
						<div class="flex-1">
							<p class="text-sm font-black text-white">{slot.label}</p>
							<p class="mt-0.5 text-xs" style="color: var(--text-muted);">
								{equipped ? equippedName : 'None equipped'}
							</p>
						</div>
						{#if equipped}
							<div class="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20">
								<IconCheck size={14} stroke-width={3} style="color: var(--cyan);" />
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{:else}
			<!-- Items for selected slot -->
			<div class="flex items-center gap-2">
				<button class="pressable rounded-lg p-2 transition-colors hover:bg-white/5" onclick={() => (selectedSlot = null)}>
					<IconArrowLeft size={16} stroke-width={2} style="color: var(--text-muted);" />
				</button>
				<p class="text-sm font-bold" style="color: var(--text-muted);">{SLOTS.find((s) => s.key === selectedSlot)?.label ?? selectedSlot}</p>
				<button class="ml-auto rounded-lg px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wide"
					style="background: var(--surface-3); color: var(--text-muted);"
					onclick={() => selectedSlot && handleUnequip(selectedSlot)}
				>Unequip all</button>
			</div>

			{#if selectedItems.length === 0}
				<div class="card py-8 text-center">
					<p class="text-sm font-bold" style="color: var(--text-muted);">No items owned for this slot.</p>
					<Button class="mt-3" href="/shop" variant="secondary">Browse shop</Button>
				</div>
			{:else}
				<div class="grid gap-3 sm:grid-cols-2">
					{#each selectedItems as item}
						{@const equipped = equippedInSlot(selectedSlot) === item.id}
						{@const accentData = item.type === 'accent' ? ACCENT_COLORS[item.id] ?? null : null}
						{@const borderData = item.type === 'avatar-border' ? BORDER_PREVIEW[item.id] ?? null : null}
						{@const skinData = item.type === 'card-skin' ? SKIN_PREVIEW[item.id] ?? null : null}
						{@const themeData = item.type === 'exam-theme' ? THEME_BGS[item.id] ?? null : null}
						<button
							class="card-sm flex cursor-pointer flex-col transition-transform active:translate-y-px"
							style="border: 1px solid {equipped ? 'var(--cyan)' : 'var(--border)'};"
							onclick={() => selectedSlot && (equipped ? handleUnequip(selectedSlot) : handleEquip(item.id, selectedSlot))}
						>
							<div class="flex items-center justify-between">
								<p class="text-sm font-black text-white">{item.name}</p>
								{#if equipped}
									<div class="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20">
										<IconCheck size={14} stroke-width={3} style="color: var(--cyan);" />
									</div>
								{/if}
							</div>

							<!-- Inline mini preview -->
							<div class="mt-3 flex justify-center">
								{#if accentData}
									<div class="h-10 w-10 rounded-full" style="background: {accentData.color}; box-shadow: 0 0 16px {accentData.color}40;"></div>
								{:else if borderData}
									<div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-black text-white"
										style="box-shadow: {borderData};">
										U
									</div>
								{:else if skinData}
									{@const skinCss = Object.entries(skinData).map(([k, v]) => `${k}:${v}`).join(';')}
								<div class="w-full max-w-[10rem] rounded-lg p-3 text-center" style={skinCss}>
										<p class="text-xs font-bold text-white">Card preview</p>
									</div>
								{:else if themeData}
									<div class="w-full max-w-[10rem] rounded-lg p-3 text-center" style="background: {themeData};">
										<p class="text-xs font-bold text-white">Theme bg</p>
									</div>
								{:else if item.type === 'title'}
									<p class="text-sm font-bold" style="color: var(--accent);">{item.name.replace('Title: ', '')}</p>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		{/if}
	</section>
{/if}
