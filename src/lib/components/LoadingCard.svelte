<script lang="ts">
	let { label = 'Loading...' } = $props<{ label?: string }>();
</script>

<div class="soft-card text-center">
	<div
		class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]"
	></div>
	<p class="font-black" style="color: var(--text-muted);">{label}</p>
</div>
