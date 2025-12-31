import { IdeaCategory } from './idea';
import { TrendSourceKind } from './trends';

export interface UserConfiguration {
  hasCustomApiKey: boolean;
  preferredCategories: IdeaCategory[];
  generationCount: number;
  preferredTrendSource?: TrendSourceKind;
  xTwitterConfig?: {
    hasToken: boolean;
    defaultQuery?: string;
  };
  encryptedXBearerToken?: string;
}

export interface UpdateConfigRequest {
  geminiApiKey?: string;
  preferredCategories?: IdeaCategory[];
  preferredTrendSource?: TrendSourceKind;
  xBearerToken?: string;
  xQuery?: string;
}
