<script lang="ts">
	import { goto } from '$app/navigation';
	import { signup } from '$lib/auth';
	import Button from '$lib/components/Button.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import favicon from '$lib/assets/favicon.png';
	import { pushToast } from '$lib/toasts';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	async function submit() {
		loading = true;
		try { await signup(email, password); goto('/dashboard'); }
		catch (error) { pushToast(error instanceof Error ? error.message : 'Unable to create account.', 'error'); }
		finally { loading = false; }
	}
</script>

<svelte:head><title>Sign Up — Qurio</title></svelte:head>

<section class="page-stack auth-page">
	<div class="card-accent accent text-center">
		<div class="mx-auto grid h-16 w-16 place-items-center rounded-[1.2rem] border-2" style="border-color: var(--border-strong); background: var(--surface-2); box-shadow: 0 7px 0 #070216;">
			<img src={favicon} alt="" class="h-12 w-12 rounded-xl" />
		</div>
		<p class="eyebrow mt-5">Start free</p>
		<h1 class="mt-3 text-3xl font-black leading-tight text-white">Create your study library.</h1>
		<p class="mx-auto mt-2 max-w-xs text-sm font-bold leading-6" style="color: var(--text-muted);">
			Save exams, unlock cosmetics, and build your quiz streak.
		</p>
	</div>

	<div class="card">
		<form class="grid gap-4" onsubmit={(event) => { event.preventDefault(); submit(); }}>
			<TextField label="Email" type="email" bind:value={email} required />
			<TextField label="Password" type="password" bind:value={password} required minlength="6" />
			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Creating account...' : 'Create account'}
			</Button>
		</form>
		<p class="mt-4 text-center text-xs font-bold" style="color: var(--text-muted);">
			Already have an account?
			<a class="ml-1 font-black underline underline-offset-4" style="color: var(--accent); text-decoration-color: var(--accent-soft);" href="/login">Log in</a>
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
