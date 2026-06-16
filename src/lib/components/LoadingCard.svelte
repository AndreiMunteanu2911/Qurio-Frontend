<script lang="ts">
	let { label = 'Loading...' } = $props<{ label?: string }>();
</script>

<div class="soft-card text-center">
	<div
		class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-cyan-200"
	></div>
	<p class="font-semibold text-violet-100">{label}</p>
</div>
