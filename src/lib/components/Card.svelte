<script lang="ts">
	let {
		class: className = '',
		children
	} = $props<{
		class?: string;
		children: import('svelte').Snippet;
	}>();
</script>

<section class={`soft-card p-5 sm:p-6 ${className}`}>
	{@render children()}
</section>
