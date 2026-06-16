<script lang="ts">
	import { goto } from '$app/navigation';
	import { signup } from '$lib/auth';
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

<section class="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
	<h1 class="text-3xl font-black text-slate-900">Create your account</h1>
	<p class="mt-2 text-slate-600">Start building focused exams from your own study material.</p>

	<form class="mt-8 grid gap-5" onsubmit={(event) => { event.preventDefault(); submit(); }}>
		<label class="grid gap-2 font-semibold text-slate-700">
			Email
			<input
				class="rounded-2xl border-slate-200 px-4 py-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
				type="email"
				bind:value={email}
				required
			/>
		</label>
		<label class="grid gap-2 font-semibold text-slate-700">
			Password
			<input
				class="rounded-2xl border-slate-200 px-4 py-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
				type="password"
				bind:value={password}
				required
				minlength="6"
			/>
		</label>
		<button
			class="pressable rounded-full border-b-emerald-700 bg-emerald-500 px-6 py-3 font-black text-white shadow-lg hover:bg-emerald-600 disabled:opacity-60"
			disabled={loading}
		>
			{loading ? 'Creating account...' : 'Sign up'}
		</button>
	</form>

	<p class="mt-6 text-center text-sm font-semibold text-slate-600">
		Already have an account? <a class="text-violet-600 hover:text-violet-700" href="/login">Log in</a>
	</p>
</section>
