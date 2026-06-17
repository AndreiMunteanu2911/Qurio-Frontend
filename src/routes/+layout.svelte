<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import { authReady, initAuth, logout, user } from '$lib/auth';
	import '@fontsource/urbanist';
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';

	let { children } = $props();

	const publicRoutes = ['/', '/login', '/signup'];
	const isProtected = $derived(!publicRoutes.includes(page.url.pathname));
	const isPublicRoute = $derived(publicRoutes.includes(page.url.pathname));

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

	const navItems = [
		{ href: '/dashboard', label: 'Home', icon: 'H' },
		{ href: '/generate', label: 'Create', icon: '+' },
		{ href: '/exams', label: 'Library', icon: 'L' }
	];
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="app-shell">
	<header class="app-nav sticky top-0 z-40">
		<nav class="app-content flex items-center justify-between gap-3 py-3">
			<a href="/" class="group flex items-center gap-3 text-white">
				<p class="text-xl font-black tracking-tight">Qurio</p>
			</a>

			<div class="hidden items-center gap-1 sm:flex">
				{#if $user && !isPublicRoute}
					{#each navItems as item}
						<a
							class={[
								'rounded-lg px-3 py-2 text-sm font-bold',
								page.url.pathname === item.href
									? 'bg-white text-[#12072d]'
									: 'text-violet-100 hover:bg-white/[0.06]'
							]}
							href={item.href}
						>
							{item.label}
						</a>
					{/each}
				{/if}
			</div>

			<div class="flex items-center gap-2">
				{#if $user}
					<Button variant="secondary" class="px-4 py-2" onclick={signOut}>
						Sign out
					</Button>
				{:else}
					<Button href="/login" variant="secondary" class="px-4 py-2">Log in</Button>
				{/if}
			</div>
		</nav>
	</header>

	<main class={['app-content pb-28 pt-4 md:pb-12 md:pt-6', (!$user || isPublicRoute) && 'pb-8']}>
		{@render children()}
	</main>

	{#if $user && !isPublicRoute}
		<nav class="bottom-nav fixed inset-x-0 bottom-0 z-40 sm:hidden">
			<div class="mx-auto grid max-w-md grid-cols-3 gap-1 p-2">
				{#each navItems as item}
					<a
						class={[
							'grid rounded-lg px-3 py-2 text-center text-xs font-bold',
							page.url.pathname === item.href
								? 'bg-white text-[#12072d]'
								: 'text-violet-200 hover:bg-white/[0.06]'
						]}
						href={item.href}
					>
						<span class="mx-auto grid h-5 w-5 place-items-center text-base leading-none">
							{item.icon}
						</span>
						<p>{item.label}</p>
					</a>
				{/each}
			</div>
		</nav>
	{/if}
</div>

<Toasts />
