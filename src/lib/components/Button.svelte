<script lang="ts">
	let {
		href,
		type = 'button',
		variant = 'primary',
		disabled = false,
		class: className = '',
		onclick,
		children
	} = $props<{
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'violet' | 'danger' | 'ghost';
		disabled?: boolean;
		class?: string;
		onclick?: () => void;
		children: import('svelte').Snippet;
	}>();

	const classes = $derived(
		[
			'pressable inline-flex min-h-12 items-center justify-center rounded-xl border-2 px-5 py-3 text-center text-sm font-extrabold tracking-normal disabled:cursor-not-allowed disabled:opacity-50',
			variant === 'primary' &&
				'border-[#6849ff] bg-[#6849ff] text-white hover:bg-[#765cff] hover:border-[#765cff] active:bg-[#5a3de0]',
			variant === 'secondary' &&
				'border-white bg-white text-[#12072d] hover:bg-violet-50 active:bg-violet-100',
			variant === 'violet' &&
				'border-[#4f33dc] bg-[#4f33dc] text-white hover:bg-[#5d43e7] hover:border-[#5d43e7] active:bg-[#432cb8]',
			variant === 'danger' &&
				'border-[#a68bc7] bg-[#a68bc7]/20 text-[#a68bc7] hover:bg-[#a68bc7]/30 active:bg-[#a68bc7]/40',
			variant === 'ghost' &&
				'border-transparent bg-transparent text-violet-100 hover:bg-white/[0.06]',
			className
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href}
	<a class={classes} {href}>
		{@render children()}
	</a>
{:else}
	<button class={classes} {type} {disabled} {onclick}>
		{@render children()}
	</button>
{/if}
