<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/auth';
	import Button from '$lib/components/Button.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import { pushToast } from '$lib/toasts';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	async function submit() {
		loading = true;
		try { await login(email, password); goto('/dashboard'); }
		catch (error) { pushToast(error instanceof Error ? error.message : 'Unable to log in.', 'error'); }
		finally { loading = false; }
	}
</script>

<svelte:head><title>Log In — Qurio</title></svelte:head>

<section class="page-stack" style="max-width: 440px; margin-inline: auto;">
	<div class="card text-center">
		<p class="eyebrow">Welcome back</p>
		<h1 class="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">Continue your practice.</h1>
	</div>

	<div class="card">
		<form class="grid gap-4" onsubmit={(event) => { event.preventDefault(); submit(); }}>
			<TextField label="Email" type="email" bind:value={email} required />
			<TextField label="Password" type="password" bind:value={password} required minlength="6" />
			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Logging in...' : 'Log in'}
			</Button>
		</form>
		<p class="mt-4 text-center text-xs font-bold" style="color: var(--text-muted);">
			New to Qurio?
			<a class="ml-1 text-white underline decoration-white/30 underline-offset-4 hover:text-cyan-200" href="/signup">Create an account</a>
		</p>
	</div>
</section>
