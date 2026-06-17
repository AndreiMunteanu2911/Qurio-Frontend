import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { getIdToken } from './auth';
import type {
  ApiErrorPayload, CompleteExamResponse, CurrencyData, Difficulty, Exam, ExamProgress,
  ExamProgressResponse, ExamResult, InventoryData, Mistake, ShareLink, XpData, StreakData, Achievement
} from './types';

const apiBase = PUBLIC_API_BASE_URL || 'http://localhost:8081';

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

async function requestPublic<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`);

  if (!response.ok) {
    let message = 'Something went wrong.';
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      message = payload.error?.message ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
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

export function getSharedExam(examId: string) {
  return requestPublic<{ id: string; title: string; difficulty: Difficulty; category: string; questions: Exam['questions']; createdAt: string }>(
    `/api/shared/${examId}`
  );
}

export function getShareLink() {
  const url = window.location.origin + window.location.pathname;
  return { url } as ShareLink;
}

export function listMistakes() {
  return request<Mistake[]>('/api/mistakes');
}

export function mistakesCount() {
  return request<{ count: number }>('/api/mistakes/count');
}

export function addMistakes(mistakes: Omit<Mistake, 'id' | 'createdAt'>[]) {
  return request<Mistake[]>('/api/mistakes', {
    method: 'POST',
    body: JSON.stringify({ mistakes })
  });
}

export function deleteMistake(mistakeId: string) {
  return request<void>(`/api/mistakes/${mistakeId}`, { method: 'DELETE' });
}

export function listResults() {
  return request<ExamResult[]>('/api/results');
}

export function saveResult(result: Omit<ExamResult, 'id' | 'createdAt'>) {
  return request<ExamResult>('/api/results', {
    method: 'POST',
    body: JSON.stringify(result)
  });
}

export function completeExam(data: {
  examId: string;
  examTitle: string;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  answers: { questionId: string; selected: number; correct: boolean }[];
}) {
  return request<CompleteExamResponse>('/api/exams/complete', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function getXp() {
  return request<XpData>('/api/xp');
}

export function getStreak() {
  return request<StreakData>('/api/streaks');
}

export function getAchievements() {
  return request<Achievement[]>('/api/achievements');
}

export function saveProgress(data: ExamProgress) {
  return request<{ saved: boolean }>('/api/exams/progress', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function listProgress() {
  return request<{ examIds: string[] }>('/api/exams/progress');
}

export function getProgress(examId: string) {
  return request<ExamProgressResponse>(`/api/exams/progress/${examId}`);
}

export function clearProgress(examId: string) {
  return request<void>(`/api/exams/progress/${examId}`, { method: 'DELETE' });
}

export function getCurrency() {
  return request<CurrencyData>('/api/currency');
}

export function getInventory() {
  return request<InventoryData>('/api/inventory');
}

export function purchaseItem(itemId: string) {
  return request<{ balance: number; owned: boolean }>('/api/inventory/purchase', {
    method: 'POST',
    body: JSON.stringify({ itemId })
  });
}

export function useItem(itemId: string) {
  return request<{ used: boolean; remaining: number }>('/api/inventory/use', {
    method: 'POST',
    body: JSON.stringify({ itemId })
  });
}

export function equipCosmetic(itemId: string | null, slot: string) {
  return request<{ activeCosmetics: Record<string, string> }>('/api/inventory/equip', {
    method: 'POST',
    body: JSON.stringify({ itemId, slot })
  });
}
