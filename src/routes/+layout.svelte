<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import Toasts from '$lib/components/Toasts.svelte';
	import { authReady, initAuth, user } from '$lib/auth';
	import '@fontsource/urbanist';
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';

	let { children } = $props();

	const isExamPage = $derived(
		page.url.pathname.startsWith('/exam/') || page.url.pathname.startsWith('/shared/')
	);
	const publicRoutes = ['/', '/login', '/signup'];
	const isPublic = $derived(publicRoutes.includes(page.url.pathname) || isExamPage);
	const isProtected = $derived(!isPublic);

	initAuth();

	$effect(() => {
		if (browser && $authReady && isProtected && !$user) {
			goto('/login');
		}
	});

	const navItems = [
		{ href: '/dashboard', label: 'Home' },
		{ href: '/generate', label: 'Create' },
		{ href: '/exams', label: 'Library' },
		{ href: '/profile', label: 'Profile' }
	];
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="app-shell">
	<!-- No top bar on exam pages -->
	{#if !isExamPage}
		<header class="app-header sticky top-0 z-40">
			<div class="app-content">
				<div class="app-header-inner">
					<a href="/" class="group flex items-center gap-3 text-white">
						<p class="text-xl font-black tracking-tight">Qurio</p>
					</a>

					{#if $user && !isPublic}
						<div class="hidden items-center gap-1 sm:flex">
							{#each navItems as item}
								<a
									class={['top-nav-link', page.url.pathname === item.href ? 'active' : '']}
									href={item.href}
								>
									{item.label}
								</a>
							{/each}
						</div>
					{/if}

					<div class="flex items-center gap-2">
						{#if !$user && !isPublic}
							<Button href="/login" variant="secondary" class="px-4 py-2">Log in</Button>
						{/if}
					</div>
				</div>
			</div>
		</header>
	{/if}

	<main
		class={[
			'app-content',
			!isExamPage ? 'pb-28 pt-4 md:pb-12 md:pt-6' : '',
			(!$user || isPublic) && !isExamPage ? 'pb-8' : ''
		]}
	>
		{@render children()}
	</main>

	{#if $user && !isPublic && !isExamPage}
		<nav class="fixed inset-x-0 bottom-0 z-40 bg-[#0b041c] sm:hidden">
			<div class="mx-auto grid max-w-md grid-cols-4 gap-1 p-2">
				{#each navItems as item}
					<a
						class={['bottom-nav-link', page.url.pathname === item.href ? 'active' : '']}
						href={item.href}
					>
						{item.label}
					</a>
				{/each}
			</div>
		</nav>
	{/if}
</div>

<Toasts />
