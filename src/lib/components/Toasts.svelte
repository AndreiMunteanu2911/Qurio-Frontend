<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toasts } from '$lib/toasts';
</script>

<div class="fixed inset-x-0 top-4 z-50 mx-auto flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-3">
	{#each $toasts as toast (toast.id)}
		<div
			in:fly={{ x: 24, duration: 160 }}
			out:fly={{ x: 24, duration: 140 }}
			class={[
				'rounded-2xl border-2 bg-white p-4 text-sm font-black shadow-[0_7px_0_#d8cfff,0_16px_28px_rgb(56_38_115_/_0.16)]',
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
