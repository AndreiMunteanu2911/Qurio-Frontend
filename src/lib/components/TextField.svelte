<script lang="ts">
	let {
		label,
		type = 'text',
		value = $bindable(''),
		required = false,
		minlength,
		maxlength,
		placeholder = ''
	} = $props<{
		label: string;
		type?: string;
		value?: string;
		required?: boolean;
		minlength?: string;
		maxlength?: string;
		placeholder?: string;
	}>();
</script>

<label class="grid gap-2 text-sm font-extrabold text-violet-100">
	{label}
	<input class="field" {type} bind:value {required} {minlength} {maxlength} {placeholder} />
</label>
