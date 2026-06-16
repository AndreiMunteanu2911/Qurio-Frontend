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

<div class={`section-header ${className}`}>
	<p class="eyebrow">{eyebrow}</p>
	<h1 class="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h1>
	{#if description}
		<p class="mt-3 text-base leading-7 text-violet-100/72">{description}</p>
	{/if}
</div>
