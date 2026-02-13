import { parseJsonResponse } from '../utils/json-parser';
import {
  buildExtractWordsPrompt,
  buildAnalyzeSentencePrompt,
  buildReadingContentPrompt,
  buildReadingQuestionsPrompt,
  buildVocabularyQuestionsPrompt,
  buildLearningReportPrompt,
} from '../utils/prompt-builder';

interface ChatCompletionResponse {
  choices: Array<{ message: { content: string } }>;
}

interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function validateAIConfig(aiConfig?: AIConfig): asserts aiConfig is AIConfig {
  if (!aiConfig?.apiKey || !aiConfig?.baseUrl || !aiConfig?.model) {
    throw new Error('请先在页面设置中配置 AI 服务（API Key、Base URL、Model）');
  }
}

async function sendRequest(prompt: string, options: { temperature?: number; maxTokens?: number } = {}, aiConfig?: AIConfig): Promise<string> {
  validateAIConfig(aiConfig);

  const res = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: aiConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`API请求失败: ${(err as any).error?.message || res.statusText}`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  return data.choices[0].message.content;
}

export async function extractWords(text: string, maxWords = 10, level = 'all', aiConfig?: AIConfig) {
  const prompt = buildExtractWordsPrompt(text, maxWords, level);
  const content = await sendRequest(prompt, { temperature: 0.7, maxTokens: 1000 }, aiConfig);
  return parseJsonResponse(content);
}

export async function analyzeSentence(sentence: string, aiConfig?: AIConfig) {
  const prompt = buildAnalyzeSentencePrompt(sentence);
  const content = await sendRequest(prompt, { temperature: 0.6, maxTokens: 2000 }, aiConfig);
  return parseJsonResponse(content);
}

export async function generateReadingContent(text: string, language = 'en', aiConfig?: AIConfig) {
  const prompt = buildReadingContentPrompt(text, language);
  const content = await sendRequest(prompt, { temperature: 0.7, maxTokens: 2000 }, aiConfig);
  const result = parseJsonResponse<{ english: string; chinese: string; vocabulary: unknown[] }>(content);
  if (!result.english || !result.chinese || !Array.isArray(result.vocabulary)) {
    throw new Error('AI返回的数据格式不正确');
  }
  return result;
}

export async function generateReadingQuestions(reading: string, questionCount = 5, aiConfig?: AIConfig) {
  const prompt = buildReadingQuestionsPrompt(reading, questionCount);
  const content = await sendRequest(prompt, { temperature: 0.6, maxTokens: 1500 }, aiConfig);
  return parseJsonResponse(content);
}

export async function generateVocabularyQuestions(vocabulary: unknown[], questionCount = 5, aiConfig?: AIConfig) {
  const prompt = buildVocabularyQuestionsPrompt(vocabulary, questionCount);
  const content = await sendRequest(prompt, { temperature: 0.7, maxTokens: 1500 }, aiConfig);
  return parseJsonResponse(content);
}

export async function generateLearningReport(reportType: string, learningData: unknown, aiConfig?: AIConfig) {
  const prompt = buildLearningReportPrompt(reportType, learningData);
  const content = await sendRequest(prompt, { temperature: 0.7, maxTokens: 1500 }, aiConfig);
  return parseJsonResponse(content);
}

export async function testConnection(aiConfig?: AIConfig): Promise<{ success: boolean; model: string }> {
  validateAIConfig(aiConfig);

  const res = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: aiConfig.model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`连接失败: ${(err as any).error?.message || res.statusText}`);
  }

  await res.json();
  return { success: true, model: aiConfig.model };
}
