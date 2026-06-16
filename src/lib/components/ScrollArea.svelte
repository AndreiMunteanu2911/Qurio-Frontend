<script lang="ts">
	let {
		maxHeight = 'min(64vh, 42rem)',
		class: className = '',
		children
	} = $props<{
		maxHeight?: string;
		class?: string;
		children: import('svelte').Snippet;
	}>();
</script>

<div
	class={`custom-scrollbar overflow-y-auto pr-1 ${className}`}
	style={`max-height: ${maxHeight}`}
>
	{@render children()}
</div>
