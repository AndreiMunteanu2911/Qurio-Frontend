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
		try {
			await login(email, password);
			goto('/dashboard');
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to log in.', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Log In — Qurio</title>
</svelte:head>

<section class="page-stack py-2">
	<div class="section-header">
		<p class="eyebrow">Welcome back</p>
		<h1 class="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Continue your practice.</h1>
		<p class="mt-3 text-base leading-7 text-violet-100/80">
			Sign in to open your saved exams and pick up where you left off.
		</p>
	</div>

	<div class="soft-card">
		<form class="grid gap-5" onsubmit={(event) => { event.preventDefault(); submit(); }}>
			<TextField label="Email" type="email" bind:value={email} required />
			<TextField label="Password" type="password" bind:value={password} required minlength="6" />
			<Button type="submit" disabled={loading}>
				{loading ? 'Logging in...' : 'Log in'}
			</Button>
		</form>

		<p class="mt-6 text-center text-sm font-semibold text-violet-100/80">
			New to Qurio?
			<a class="text-white underline decoration-white/30 underline-offset-4 hover:text-cyan-200" href="/signup">
				Create an account
			</a>
		</p>
	</div>
</section>
