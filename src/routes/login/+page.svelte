<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/auth';
	import Button from '$lib/components/Button.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import favicon from '$lib/assets/favicon.png';
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

<section class="page-stack auth-page">
	<div class="card-accent accent text-center">
		<div class="mx-auto grid h-16 w-16 place-items-center rounded-[1.2rem] border-2" style="border-color: var(--border-strong); background: var(--surface-2); box-shadow: 0 7px 0 #070216;">
			<img src={favicon} alt="" class="h-12 w-12 rounded-xl" />
		</div>
		<p class="eyebrow mt-5">Welcome back</p>
		<h1 class="mt-3 text-3xl font-black leading-tight text-white">Continue your practice.</h1>
		<p class="mx-auto mt-2 max-w-xs text-sm font-bold leading-6" style="color: var(--text-muted);">
			Log in to resume your library, cosmetics, streaks, and results.
		</p>
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
			<a class="ml-1 font-black underline underline-offset-4" style="color: var(--accent); text-decoration-color: var(--accent-soft);" href="/signup">Create an account</a>
		</p>
	</div>
</section>

<style>
	.auth-page {
		max-width: 440px;
		margin-inline: auto;
		padding-block: 0.35rem 1rem;
	}
</style>
