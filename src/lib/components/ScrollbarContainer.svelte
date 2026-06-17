<script lang="ts">
	let {
		children,
		horizontal = false,
		class: className = '',
		maxHeight,
		...rest
	} = $props<{
		children: import('svelte').Snippet;
		horizontal?: boolean;
		class?: string;
		maxHeight?: string;
		[key: string]: unknown;
	}>();
</script>

<div
	class="scrollbar-container {className}"
	style="overflow: {horizontal ? 'auto hidden' : 'hidden auto'};{maxHeight ? `max-height: ${maxHeight};` : ''}"
	{...rest}
>
	{@render children()}
</div>

<style>
	.scrollbar-container {
		scrollbar-width: thin;
		scrollbar-color: var(--violet) rgba(0 0 0 / 0.3);
	}
	.scrollbar-container::-webkit-scrollbar {
		width: 6px;
		height: 6px;
	}
	.scrollbar-container::-webkit-scrollbar-track {
		background: transparent;
	}
	.scrollbar-container::-webkit-scrollbar-thumb {
		background: var(--violet);
		border-radius: 999px;
	}
	.scrollbar-container::-webkit-scrollbar-thumb:hover {
		background: color-mix(in srgb, var(--violet) 80%, white);
	}
</style>
