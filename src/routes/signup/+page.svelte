<script lang="ts">
	import { goto } from '$app/navigation';
	import { signup } from '$lib/auth';
	import Button from '$lib/components/Button.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import { pushToast } from '$lib/toasts';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	async function submit() {
		loading = true;
		try {
			await signup(email, password);
			goto('/dashboard');
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Unable to create account.', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign Up — Qurio</title>
</svelte:head>

<section class="page-stack py-2">
	<div class="section-header">
		<p class="eyebrow">Start free</p>
		<h1 class="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Create your study library.</h1>
		<p class="mt-3 text-base leading-7 text-violet-100/80">
			Generate exams, save them to your account, and retake them whenever you need practice.
		</p>
	</div>

	<div class="soft-card">
		<form class="grid gap-5" onsubmit={(event) => { event.preventDefault(); submit(); }}>
			<TextField label="Email" type="email" bind:value={email} required />
			<TextField label="Password" type="password" bind:value={password} required minlength="6" />
			<Button type="submit" disabled={loading}>
				{loading ? 'Creating account...' : 'Create account'}
			</Button>
		</form>

		<p class="mt-6 text-center text-sm font-semibold text-violet-100/80">
			Already have an account?
			<a class="text-white underline decoration-white/30 underline-offset-4 hover:text-cyan-200" href="/login">
				Log in
			</a>
		</p>
	</div>
</section>
