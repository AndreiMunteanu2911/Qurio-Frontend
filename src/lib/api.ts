import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { getIdToken } from './auth';
import type { ApiErrorPayload, Difficulty, Exam } from './types';

const apiBase = PUBLIC_API_BASE_URL || 'http://localhost:8080';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const token = await getIdToken();
	const response = await fetch(`${apiBase}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			...options.headers
		}
	});

	if (!response.ok) {
		let message = 'Something went wrong. Please try again.';
		try {
			const payload = (await response.json()) as ApiErrorPayload;
			message = payload.error?.message ?? message;
		} catch {
			message = response.statusText || message;
		}
		throw new Error(message);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return (await response.json()) as T;
}

export function generateExam(prompt: string, difficulty: Difficulty) {
	return request<Exam>('/api/exams/generate', {
		method: 'POST',
		body: JSON.stringify({ prompt, difficulty })
	});
}

export function listExams() {
	return request<Exam[]>('/api/exams');
}

export function getExam(examId: string) {
	return request<Exam>(`/api/exams/${examId}`);
}

export function deleteExam(examId: string) {
	return request<void>(`/api/exams/${examId}`, { method: 'DELETE' });
}
