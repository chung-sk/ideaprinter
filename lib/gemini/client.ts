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
      console.log(`🤖 Calling Gemini API with model: ${this.model}`);
      const model = this.client.getGenerativeModel({ model: this.model });

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Generation timeout exceeded')), timeoutMs);
      });

      // Create generation promise
      const generationPromise = model.generateContent(prompt);

      // Race between generation and timeout
      const result = await Promise.race([generationPromise, timeoutPromise]);

      const response = await result.response;
      const text = response.text();

      console.log(`✅ Successfully generated idea using ${this.model}`);
      return text;
    } catch (error) {
      console.error(`❌ Failed to generate idea using ${this.model}:`, error);
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw new Error('Unknown error occurred during idea generation');
    }
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
