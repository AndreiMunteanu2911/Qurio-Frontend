<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import LoadingCard from '$lib/components/LoadingCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import { getInventory, equipCosmetic } from '$lib/api';
	import { SHOP_ITEMS } from '$lib/shop';
	import { badgeRefresh } from '$lib/refresh';
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

	const SKIN_PREVIEW: Record<string, Record<string, string>> = {
		skin_minimal: { border: '2px solid #cfc5ed', background: '#ffffff', boxShadow: '0 6px 0 #e5ddfa' },
		skin_gradient: { border: '2px solid #9f86ff', background: 'linear-gradient(135deg, #ffffff, #eee8ff 52%, #e6f2ff)', boxShadow: '0 7px 0 #b8a9ff' },
		skin_neon: { border: '2px solid #2f80ff', background: 'linear-gradient(145deg, #ffffff, #e8f2ff)', boxShadow: '0 7px 0 #9cc7ff, 0 0 20px rgb(47 128 255 / 0.28)' },
		skin_glass: { background: 'rgb(255 255 255 / 0.7)', backdropFilter: 'blur(16px)', border: '2px solid rgb(255 255 255 / 0.95)', boxShadow: '0 7px 0 rgb(216 207 255 / 0.72)' },
		skin_classic: { border: '2px solid #d7caff', background: '#ffffff', boxShadow: '0 7px 0 #d8cfff' },
		skin_terminal: { background: 'linear-gradient(145deg, #fbffff, #e8fff5)', border: '2px solid #55d99c', boxShadow: '0 7px 0 #9de6c5' },
		skin_hologram: { background: 'linear-gradient(135deg, #ffffff, #efe8ff 35%, #e6f4ff 70%, #fff7cf)', border: '2px solid #9f86ff', boxShadow: '0 7px 0 #d8cfff, 0 0 20px rgb(125 211 252 / 0.22)' },
		skin_paper: { background: 'linear-gradient(145deg, #fffdf7, #f3edff)', border: '2px solid #c5afea', boxShadow: '0 7px 0 #ded2ff' },
		skin_obsidian: { background: 'linear-gradient(145deg, #ffffff, #f2efff)', border: '2px solid #6849ff', boxShadow: '0 7px 0 #7f65ec' },
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
			badgeRefresh.update(n => n + 1);
			pushToast('Equipped!', 'success');
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
									<div class="flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-black"
										style="background: var(--surface-2); border-color: var(--border); color: var(--text); box-shadow: {borderData};">
										U
									</div>
								{:else if skinData}
									{@const skinCss = Object.entries(skinData).map(([k, v]) => `${k}:${v}`).join(';')}
								<div class="w-full max-w-[10rem] rounded-lg p-3 text-center" style={skinCss}>
										<p class="text-xs font-bold" style="color: var(--text);">Card preview</p>
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
