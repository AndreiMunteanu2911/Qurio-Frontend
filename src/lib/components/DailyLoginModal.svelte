<script lang="ts">
	import { fly } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import { IconCoin, IconFlame } from '@tabler/icons-svelte';

	let {
		loginStreak = 1,
		coinsAwarded = 0,
		onClaim = () => {},
		onClose = () => {}
	} = $props<{
		loginStreak: number;
		coinsAwarded: number;
		onClaim: () => void;
		onClose: () => void;
	}>();
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
	role="dialog"
	aria-modal="true"
	aria-label="Daily login bonus"
	onclick={onClose}
	onkeydown={(e) => e.key === 'Escape' && onClose()}
>
	<div
		in:fly={{ y: 20, duration: 200 }}
		class="card text-center"
		style="max-width: 22rem; width: 100%;"
		onclick={(e) => e.stopPropagation()}
	>
		<div class="flex justify-center">
			<div class="flex h-14 w-14 items-center justify-center rounded-full" style="background: rgb(255 200 0 / 0.12);">
				<IconCoin size={28} stroke-width={2} style="color: #ffc800;" />
			</div>
		</div>
		<h1 class="mt-4 text-2xl font-black text-white">Welcome back!</h1>
		<p class="mt-1 text-sm" style="color: var(--text-muted);">
			Day {loginStreak} login streak
		</p>
		<div class="mt-4 flex items-center justify-center gap-2">
			<span class="text-3xl font-black" style="color: #ffc800;">+{coinsAwarded}</span>
			<IconCoin size={22} stroke-width={2} style="color: #ffc800;" />
		</div>
		<p class="mt-1 text-xs font-bold" style="color: var(--text-muted);">Daily login bonus</p>

		{#if loginStreak >= 7}
			<div class="mt-3 flex items-center justify-center gap-1">
				<IconFlame size={14} stroke-width={2} style="color: var(--cyan);" />
				<span class="text-xs font-bold" style="color: var(--cyan);">Week streak bonus +1</span>
			</div>
		{/if}

		<Button class="mt-5 w-full" onclick={onClaim}>
			Claim <IconCoin size={14} stroke-width={2} />
		</Button>
		<button class="mt-2 w-full text-xs font-bold pressable" style="color: var(--text-muted); padding: 0.5rem;" onclick={onClose}>
			Skip
		</button>
	</div>
</div>
