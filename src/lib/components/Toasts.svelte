<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toasts } from '$lib/toasts';
</script>

<div class="toast-stack fixed inset-x-0 z-50 mx-auto flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-3">
	{#each $toasts as toast (toast.id)}
		<div
			in:fly={{ x: 24, duration: 160 }}
			out:fly={{ x: 24, duration: 140 }}
			class={[
				'rounded-2xl border-2 bg-[var(--surface)] p-4 text-sm font-black shadow-[0_7px_0_#070216,0_16px_28px_rgb(0_0_0_/_0.28)]',
				toast.type === 'error'
					? 'border-[#c6ace6] text-[#684996]'
					: toast.type === 'success'
						? 'border-[var(--accent-shadow)] text-[var(--accent)]'
						: 'border-[var(--accent-shadow)] text-[var(--violet)]'
			]}
		>
			{toast.message}
		</div>
	{/each}
</div>

<style>
	.toast-stack {
		bottom: 6.25rem;
	}

	@media (min-width: 640px) {
		.toast-stack {
			bottom: 1.5rem;
		}
	}
</style>
