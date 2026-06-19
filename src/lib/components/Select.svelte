<script lang="ts" generics="T extends string">
	let {
		value = $bindable<T>(),
		options,
		label
	} = $props<{
		value: T;
		options: readonly T[];
		label?: string;
	}>();

	let open = $state(false);
	let wrap = $state<HTMLDivElement>();
	let selectedLabel = $derived(value === 'all' ? (label ?? 'All') : value);

	function toggle() { open = !open; }

	$effect(() => {
		if (!open) return;
		function handler(e: MouseEvent) {
			if (wrap && !wrap.contains(e.target as Node)) open = false;
		}
		requestAnimationFrame(() => document.addEventListener('click', handler));
		return () => document.removeEventListener('click', handler);
	});

	function pick(v: T) { value = v; open = false; }
</script>

<div class="select-wrap" bind:this={wrap}>
	<button
		type="button"
		class="field select-trigger capitalize"
		class:select-open={open}
		onclick={toggle}
	>
		{selectedLabel}
	</button>
	{#if open}
		<div class="select-dropdown">
			{#each options as opt}
				<button
					type="button"
					class="select-option capitalize"
					class:selected={opt === value}
					onclick={() => pick(opt)}
				>
					{opt === 'all' ? (label ?? 'All') : opt}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.select-wrap {
		position: relative;
		margin-top: 0.5rem;
	}
	.select-trigger {
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		width: 100%;
	}
	.select-trigger::after {
		content: '';
		width: 0.75rem;
		height: 0.75rem;
		background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23e2daff' opacity='0.55' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat center;
		background-size: contain;
		flex-shrink: 0;
		transition: transform 0.15s;
	}
	.select-open::after {
		transform: rotate(180deg);
	}
	.select-dropdown {
		position: absolute;
		top: calc(100% + 0.25rem);
		left: 0;
		right: 0;
		z-index: 50;
		border-radius: 1rem;
		background: var(--surface);
		border: 2px solid var(--border);
		box-shadow: 0 8px 0 #070216, 0 18px 28px rgb(0 0 0 / 0.26);
		overflow: hidden;
	}
	.select-option {
		width: 100%;
		text-align: left;
		padding: 0.65rem 0.9rem;
		font-size: 0.875rem;
		font-weight: 850;
		color: var(--text);
		background: transparent;
		border: none;
		cursor: pointer;
	}
	.select-option:hover,
	.select-option.selected {
		background: var(--accent-soft);
		color: var(--accent);
	}
</style>
