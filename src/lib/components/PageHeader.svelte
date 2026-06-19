<script lang="ts">
	let {
		eyebrow,
		title,
		description = '',
		class: className = ''
	} = $props<{
		eyebrow: string;
		title: string;
		description?: string;
		class?: string;
	}>();
</script>

<div class={`section-header card-accent accent ${className}`}>
	<p class="eyebrow">{eyebrow}</p>
	<h1 class="mt-3 text-3xl font-black leading-tight" style="color: var(--text);">{title}</h1>
	{#if description}
		<p class="mt-3 text-base leading-7" style="color: var(--text-muted);">{description}</p>
	{/if}
</div>
