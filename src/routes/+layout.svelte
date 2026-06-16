<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Toasts from '$lib/components/Toasts.svelte';
	import { authReady, initAuth, logout, user } from '$lib/auth';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const publicRoutes = ['/', '/login', '/signup'];
	const isProtected = $derived(!publicRoutes.includes(page.url.pathname));

	initAuth();

	$effect(() => {
		if (browser && $authReady && isProtected && !$user) {
			goto('/login');
		}
	});

	async function signOut() {
		await logout();
		goto('/');
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-slate-50">
	<header class="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/90 backdrop-blur">
		<nav class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
			<a href="/" class="flex items-center gap-3 font-black text-slate-900">
				<span
					class="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500 text-lg text-white shadow-lg"
					>Q</span
				>
				<span>Qurio</span>
			</a>

			<div class="flex items-center gap-2">
				{#if $user}
					<a class="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white" href="/dashboard"
						>Dashboard</a
					>
					<a class="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white" href="/exams"
						>Saved</a
					>
					<button
						class="pressable rounded-full border-b-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-lg"
						onclick={signOut}
					>
						Sign out
					</button>
				{:else}
					<a class="rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white" href="/login"
						>Log in</a
					>
					<a
						class="pressable rounded-full border-b-emerald-700 bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-emerald-600"
						href="/signup">Sign up</a
					>
				{/if}
			</div>
		</nav>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>

<Toasts />
