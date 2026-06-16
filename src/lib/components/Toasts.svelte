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
				'rounded-lg border bg-[#130a2b] p-4 text-sm font-bold',
				toast.type === 'error'
					? 'border-rose-300/35 text-rose-100'
					: toast.type === 'success'
						? 'border-cyan-300/35 text-cyan-100'
						: 'border-violet-300/35 text-violet-100'
			]}
		>
			{toast.message}
		</div>
	{/each}
</div>
