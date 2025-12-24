import { IdeaCategory } from './idea';

export interface UserConfiguration {
  hasCustomApiKey: boolean;
  preferredCategories: IdeaCategory[];
  generationCount: number;
}

export interface UpdateConfigRequest {
  geminiApiKey?: string;
  preferredCategories?: IdeaCategory[];
}
