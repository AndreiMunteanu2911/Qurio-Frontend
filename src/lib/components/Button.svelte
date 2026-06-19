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
			'pressable theme-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 px-5 py-3 text-center text-sm font-black tracking-normal shadow-[0_7px_0_var(--button-shadow)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
			variant === 'primary' &&
				'[--button-shadow:var(--accent-shadow)] border-[var(--cyan)] bg-[var(--cyan)] text-white hover:border-[var(--accent)] hover:bg-[var(--accent)] active:bg-[var(--cyan)]',
			variant === 'secondary' &&
				'theme-button-secondary [--button-shadow:var(--accent-shadow)] border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--accent-soft)] active:bg-[var(--accent-soft)]',
			variant === 'violet' &&
				'[--button-shadow:var(--accent-shadow)] border-[var(--violet)] bg-[var(--violet)] text-white hover:border-[var(--accent)] hover:bg-[var(--accent)] active:bg-[var(--violet)]',
			variant === 'danger' &&
				'[--button-shadow:#070216] border-[var(--incorrect)] bg-[var(--incorrect-bg)] text-[var(--incorrect)] hover:bg-[rgb(166_139_199_/_0.2)] active:bg-[rgb(166_139_199_/_0.26)]',
			variant === 'ghost' &&
				'[--button-shadow:transparent] border-transparent bg-transparent text-[var(--violet)] shadow-none hover:bg-[var(--accent-soft)]',
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
