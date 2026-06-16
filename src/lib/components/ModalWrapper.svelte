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
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 grid place-items-end bg-black/70 p-3 sm:place-items-center"
		transition:fade={{ duration: 140 }}
		role="presentation"
		onclick={onClose}
	>
		<section
			class="soft-card w-full max-w-md p-5"
			transition:scale={{ start: 0.96, duration: 160 }}
			role="dialog"
			aria-modal="true"
			aria-label={title}
			onclick={(event) => event.stopPropagation()}
		>
			<div class="flex items-start justify-between gap-4">
				<div>
					<h2 class="text-xl font-black text-white">{title}</h2>
					{#if description}
						<p class="mt-2 text-sm leading-6 text-violet-100">{description}</p>
					{/if}
				</div>
				<button
					class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white font-black text-[#12072d] hover:bg-violet-50"
					type="button"
					aria-label="Close modal"
					onclick={onClose}
				>
					x
				</button>
			</div>

			{#if children}
				<div class="mt-5">
					{@render children()}
				</div>
			{/if}

			{#if footer}
				<div class="mt-6 flex flex-col gap-2 sm:flex-row">
					{@render footer()}
				</div>
			{/if}
		</section>
	</div>
{/if}
