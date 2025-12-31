import type { TrendProvenance, TrendSourceKind } from './trends';

export const IDEA_CATEGORIES = [
  'Technology',
  'Travel',
  'Finance',
  'Health',
  'Education',
  'Entertainment',
  'Productivity',
  'Social',
  'E-commerce',
  'Other',
] as const;

export type IdeaCategory = typeof IDEA_CATEGORIES[number];

// Data model types (per data-model.md)

export interface GeneratedIdea {
  id: string;
  appName: string;
  category: IdeaCategory;
  concept: string;
  theGap: string;
  theFix: string;
  generatedAt: string; // ISO 8601
  uniqueId: string;
  deletedAt?: string; // ISO 8601, for soft delete
  provenance?: TrendProvenance;
}

export const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-3-flash-preview',
] as const;

export type GeminiModel = typeof GEMINI_MODELS[number];

export interface UserConfiguration {
  id: string;
  encryptedGeminiApiKey?: string; // AES-256 encrypted API key
  preferredModel?: GeminiModel; // Selected AI model
  preferredCategories?: IdeaCategory[];
  preferredSource?: TrendSourceKind;
  generationCount: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  xTwitterConfig?: {
    hasToken: boolean;
    defaultQuery?: string;
  };
  encryptedXBearerToken?: string; // AES-256 encrypted X bearer token
}

export interface GenerationRequest {
  id: string;
  status: 'pending' | 'success' | 'failed';
  startedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  durationMs?: number;
  errorMessage?: string;
  generatedIdeaId?: string;
  apiKeySource: 'default' | 'user_provided';
}

// API types

export interface IdeaGenerationRequest {
  userApiKey?: string;
  preferredCategory?: IdeaCategory;
  modelName?: GeminiModel;
  trendContext?: {
    content: string;
    source: string;
    author?: string;
  };
}

export interface IdeaGenerationResponse {
  id: string;
  appName: string;
  category: IdeaCategory;
  concept: string;
  theGap: string;
  theFix: string;
  generatedAt: string;
  uniqueId: string;
  durationMs: number;
  apiKeySource: 'default' | 'user_provided';
}
