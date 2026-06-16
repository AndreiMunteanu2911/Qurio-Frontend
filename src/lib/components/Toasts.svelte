<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toasts } from '$lib/toasts';
</script>

<div class="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
	{#each $toasts as toast (toast.id)}
		<div
			in:fly={{ x: 24, duration: 160 }}
			out:fly={{ x: 24, duration: 140 }}
			class={[
				'rounded-2xl border-b-4 bg-white p-4 text-sm font-semibold shadow-lg',
				toast.type === 'error'
					? 'border-rose-300 text-rose-600'
					: toast.type === 'success'
						? 'border-emerald-300 text-emerald-700'
						: 'border-violet-300 text-violet-700'
			]}
		>
			{toast.message}
		</div>
	{/each}
</div>
