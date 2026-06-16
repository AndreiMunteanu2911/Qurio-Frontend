<script lang="ts">
	let { label = 'Loading...' } = $props<{ label?: string }>();
</script>

<div class="rounded-2xl bg-white p-8 text-center shadow-lg">
	<div
		class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500"
	></div>
	<p class="font-semibold text-slate-600">{label}</p>
</div>
