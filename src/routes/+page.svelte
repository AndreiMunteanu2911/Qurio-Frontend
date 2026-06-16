<script lang="ts">
	import { user } from '$lib/auth';
</script>

<section class="grid min-h-[calc(100vh-9rem)] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
	<div>
		<p class="mb-4 inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-600">
			AI exams that feel like practice, not paperwork
		</p>
		<h1 class="max-w-3xl text-5xl font-black leading-tight text-slate-900 sm:text-6xl">
			Turn any topic into a polished 10-question exam.
		</h1>
		<p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
			Qurio generates custom multiple-choice exams, walks you through one question at a time,
			and explains each answer instantly so you can learn while you test yourself.
		</p>
		<div class="mt-8 flex flex-col gap-3 sm:flex-row">
			<a
				class="pressable rounded-full border-b-emerald-700 bg-emerald-500 px-7 py-4 text-center font-black text-white shadow-lg hover:bg-emerald-600"
				href={$user ? '/generate' : '/signup'}
			>
				Generate Exam
			</a>
			<a
				class="pressable rounded-full border-b-violet-700 bg-violet-500 px-7 py-4 text-center font-black text-white shadow-lg hover:bg-violet-600"
				href={$user ? '/dashboard' : '/login'}
			>
				{$user ? 'Open Dashboard' : 'Login'}
			</a>
		</div>
	</div>

	<div class="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
		<div class="mb-5 flex items-center justify-between">
			<span class="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
				Preview
			</span>
			<span class="text-sm font-bold text-slate-400">Question 4 / 10</span>
		</div>
		<h2 class="text-2xl font-semibold leading-relaxed text-slate-800">
			Which idea best explains how Qurio protects AI provider keys?
		</h2>
		<div class="mt-8 grid gap-3">
			<div class="rounded-2xl border border-slate-200 border-b-slate-300 bg-white px-5 py-4 font-semibold text-slate-500 shadow-lg">
				The browser stores provider keys locally.
			</div>
			<div class="rounded-2xl border border-emerald-200 border-b-emerald-700 bg-emerald-500 px-5 py-4 font-semibold text-white shadow-lg">
				The backend proxies all AI requests.
			</div>
			<div class="rounded-2xl border border-slate-200 border-b-slate-300 bg-white px-5 py-4 font-semibold text-slate-500 shadow-lg">
				The user pastes keys before each exam.
			</div>
		</div>
		<div class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
			<p class="font-black text-emerald-700">Correct</p>
			<p class="mt-2 text-slate-700">
				OpenRouter credentials stay on the Express server, while the frontend sends only a Firebase
				ID token.
			</p>
		</div>
	</div>
</section>
