import type { AIConfig } from '@/types';
import { STORAGE_KEY } from './ai-providers';

const API_BASE = '/api/v1';

function getAIConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const cfg = JSON.parse(raw) as AIConfig;
    return cfg.apiKey ? cfg : null;
  } catch {
    return null;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let finalOptions = { ...options };

  // Auto-inject aiConfig into POST body
  if (finalOptions.method === 'POST' && finalOptions.body) {
    const aiConfig = getAIConfig();
    if (aiConfig) {
      const body = JSON.parse(finalOptions.body as string);
      body.aiConfig = aiConfig;
      finalOptions.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...finalOptions,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || '请求失败');
  }
  return res.json();
}

export const api = {
  flashcards: {
    extract: (text: string, maxWords?: number, level?: string) =>
      request('/flashcards/extract', {
        method: 'POST',
        body: JSON.stringify({ text, maxWords, level }),
      }),
  },
  sentence: {
    analyze: (sentence: string) =>
      request('/sentence/analyze', {
        method: 'POST',
        body: JSON.stringify({ sentence }),
      }),
  },
  reading: {
    generate: (text: string, language?: string) =>
      request('/reading/generate', {
        method: 'POST',
        body: JSON.stringify({ text, language }),
      }),
  },
  quiz: {
    readingQuestions: (reading: string, questionCount?: number) =>
      request('/quiz/reading-questions', {
        method: 'POST',
        body: JSON.stringify({ reading, questionCount }),
      }),
    vocabularyQuestions: (vocabulary: unknown[], questionCount?: number) =>
      request('/quiz/vocabulary-questions', {
        method: 'POST',
        body: JSON.stringify({ vocabulary, questionCount }),
      }),
  },
  report: {
    generate: (reportType: string, learningData: unknown) =>
      request('/report/generate', {
        method: 'POST',
        body: JSON.stringify({ reportType, learningData }),
      }),
  },
  health: () => request<{ status: string }>('/health'),
  ai: {
    test: (aiConfig: AIConfig) =>
      request<{ success: boolean; model: string }>('/ai/test', {
        method: 'POST',
        body: JSON.stringify({ aiConfig }),
      }),
  },
};
