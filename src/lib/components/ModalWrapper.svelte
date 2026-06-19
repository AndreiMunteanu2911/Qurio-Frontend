<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let {
		open = false,
		title,
		description = '',
		onClose = () => {},
		children,
		footer
	} = $props<{
		open: boolean;
		title: string;
		description?: string;
		onClose?: () => void;
		children?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
	}>();

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={keydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 grid place-items-end bg-[#130a2b]/55 p-3 backdrop-blur-sm sm:place-items-center"
		transition:fade={{ duration: 120 }}
		role="presentation"
		onclick={onClose}
	>
		<div
			class="game-modal w-full max-w-md rounded-[1.5rem] border-2 border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_0_#070216,0_22px_44px_rgb(0_0_0_/_0.32)]"
			transition:scale={{ start: 0.94, duration: 140 }}
			role="dialog"
			aria-modal="true"
			aria-label={title}
			tabindex="-1"
			onkeydown={(e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }}
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0">
					<h2 class="text-lg font-black" style="color: var(--text);">{title}</h2>
					{#if description}
						<p class="mt-1.5 text-sm leading-5" style="color: var(--text-muted);">{description}</p>
					{/if}
				</div>
				<button
					class="grid h-8 w-8 shrink-0 place-items-center rounded-xl border-2 font-black shadow-[0_4px_0_#070216]"
					style="background: var(--surface-2); border-color: var(--border); color: var(--violet);"
					type="button"
					aria-label="Close"
					onclick={onClose}
				>
					X
				</button>
			</div>

			{#if children}
				<div class="mt-4">
					{@render children()}
				</div>
			{/if}

			{#if footer}
				<div class="mt-5 flex flex-col gap-2 sm:flex-row">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(.game-modal .text-white) { color: var(--text) !important; }
</style>
