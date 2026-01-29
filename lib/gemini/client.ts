import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiModel } from '@/lib/types/idea';

export class GeminiClient {
  private client: GoogleGenerativeAI;
  private model: GeminiModel;

  constructor(apiKey: string, model: GeminiModel = 'gemini-2.5-flash') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateIdea(prompt: string, timeoutMs: number = 5000): Promise<string> {
    try {
      console.log(`�robot Calling Gemini API with model: ${this.model}`);
      const model = this.client.getGenerativeModel({ model: this.model });

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 60 seconds. Please try again.')), timeoutMs);
      });

      // Create generation promise
      const generationPromise = model.generateContent(prompt);

      // Race between generation and timeout
      const result = await Promise.race([generationPromise, timeoutPromise]);

      const response = await result.response;
      const text = response.text();

      console.log(`✅ Successfully generated idea using ${this.model}`);
      return text;
    } catch (error: unknown) {
      console.error(`❌ Failed to generate idea using ${this.model}:`, error);
      throw this.parseError(error);
    }
  }

  private parseError(error: unknown): Error {
    // Handle timeout
    if (error instanceof Error && error.message === 'Request timed out after 60 seconds. Please try again.') {
      return error;
    }

    const errorObj = error as { status?: number; message?: string };
    const errorMessage = error instanceof Error ? error.message : errorObj.message;

    // Parse quota/rate limit errors
    if (errorObj.status === 429 || errorMessage?.includes('quota') || errorMessage?.includes('429')) {
      return this.parseQuotaError(error);
    }

    // Parse other common errors
    if (errorObj.status === 401) {
      return new Error('Invalid API key. Please check your Gemini API key in Settings.');
    }

    if (errorObj.status === 404) {
      return new Error('Model not found. Please select a valid model in Settings.');
    }

    if (errorObj.status === 400 && errorMessage?.includes('payload size exceeds')) {
      return new Error('Input is too long. Please try a shorter prompt.');
    }

    // Generic fallback
    if (error instanceof Error) {
      return new Error(`Generation failed: ${error.message}`);
    }

    return new Error('An unexpected error occurred. Please try again.');
  }

  private parseQuotaError(error: unknown): Error {
    let limit = '20';
    let model = this.model;

    const errorObj = error as { status?: number; message?: string; errorDetails?: Array<Record<string, unknown>> };

    try {
      // The error structure from Gemini API includes errorDetails array
      // Example from actual error:
      // errorDetails: [
      //   { "@type": "type.googleapis.com/google.rpc.Help", links: [...] },
      //   { "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations: [...] },
      //   { "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "54s" }
      // ]

      if (errorObj.errorDetails && Array.isArray(errorObj.errorDetails)) {
        for (const detail of errorObj.errorDetails) {
          const detailType = String(detail['@type'] || '');
          
          // Extract retry delay from RetryInfo
          if (detailType.includes('RetryInfo') && detail.retryDelay) {
            const delayStr = String(detail.retryDelay).replace('s', '');
            const seconds = parseFloat(delayStr);
            // Note: retrySeconds is only used for logging, not in final error message
            if (!isNaN(seconds) && seconds > 0) {
              // Retry info extracted but not used in current implementation
            }
          }
          
          // Extract quota limit from QuotaFailure
          if (detailType.includes('QuotaFailure') && Array.isArray((detail as { violations?: unknown[] }).violations)) {
            const violations = (detail as { violations: Array<Record<string, unknown>> }).violations;
            const violation = violations[0];
            if (violation?.quotaValue) {
              limit = String(violation.quotaValue);
            }
            // Also try to get model name from quotaDimensions
            if (violation?.quotaDimensions && typeof violation.quotaDimensions === 'object') {
              const quotaDimensions = violation.quotaDimensions as { model?: string };
              if (quotaDimensions.model) {
                model = quotaDimensions.model as GeminiModel;
              }
            }
          }
        }
      }

      // Fallback: Try to parse from error message string
      const errorMessage = errorObj.message || JSON.stringify(error);
      
      // Look for "limit: XX" pattern
      const limitMatch = errorMessage.match(/limit:\s*(\d+)/i);
      if (limitMatch) {
        limit = limitMatch[1];
      }

      // Look for "retry in XXs" pattern (not currently used in error message)
      // const retryMatch = errorMessage.match(/retry in\s+([\d.]+)s/i);

      // Look for model name
      const modelMatch = errorMessage.match(/model[:\s]+([a-z0-9.-]+)/i);
      if (modelMatch) {
        model = modelMatch[1] as GeminiModel;
      }
    } catch (e) {
      console.warn('Failed to parse quota error details, using defaults', e);
    }

    // Calculate time until midnight Pacific Time (when quotas reset)
    const { resetTimeFormatted, timeUntilReset } = this.getQuotaResetTime();

    const message = `Daily quota limit reached (${limit} requests per day for ${model}).\n\nPlease wait ${timeUntilReset} until quota resets.\n\nDaily quota resets at ${resetTimeFormatted}.\n\nOr add your own Gemini API key in Settings for unlimited usage.`;
    
    return new Error(message);
  }

  private getQuotaResetTime(): { resetTimeFormatted: string; timeUntilReset: string } {
    // Google API quotas reset at midnight Pacific Time (PT)
    const now = new Date();
    
    // Get current time in Pacific timezone
    const ptTimeString = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    const ptNow = new Date(ptTimeString);
    
    // Calculate midnight PT tomorrow
    const midnightPT = new Date(ptNow);
    midnightPT.setHours(24, 0, 0, 0);
    
    // Calculate time until midnight PT
    const msUntilMidnightPT = midnightPT.getTime() - ptNow.getTime();
    const hoursUntilReset = Math.floor(msUntilMidnightPT / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor((msUntilMidnightPT % (1000 * 60 * 60)) / (1000 * 60));
    
    // Format the reset time in user's local timezone
    const resetTimeLocalMs = now.getTime() + msUntilMidnightPT;
    const resetTimeLocal = new Date(resetTimeLocalMs);
    const resetTimeFormatted = resetTimeLocal.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Format time until reset
    let timeUntilReset: string;
    if (hoursUntilReset > 0) {
      timeUntilReset = `${hoursUntilReset}h ${minutesUntilReset}m`;
    } else {
      timeUntilReset = `${minutesUntilReset} minutes`;
    }
    
    return { resetTimeFormatted, timeUntilReset };
  }

  async streamIdea(prompt: string): Promise<AsyncIterable<string>> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const result = await model.generateContentStream(prompt);

    async function* streamGenerator() {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }
    }

    return streamGenerator();
  }
}

export function createGeminiClient(apiKey?: string, model?: GeminiModel): GeminiClient {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('Gemini API key is required');
  }

  return new GeminiClient(key, model || 'gemini-2.5-flash');
}
