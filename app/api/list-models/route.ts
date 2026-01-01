import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  supportedGenerationMethods: string[];
  inputTokenLimit: number;
  outputTokenLimit: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get API key from query params or use default
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey') || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is required' }, { status: 400 });
    }

    // Manually fetch models using the REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch models: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const models = data.models || [];

    // Format the response with useful information
    const modelsList = models.map((model: GeminiModel) => ({
      name: model.name,
      displayName: model.displayName,
      description: model.description,
      supportedGenerationMethods: model.supportedGenerationMethods,
      inputTokenLimit: model.inputTokenLimit,
      outputTokenLimit: model.outputTokenLimit,
    }));

    // Filter models that support generateContent
    const generateContentModels = modelsList.filter((model: GeminiModel) =>
      model.supportedGenerationMethods?.includes('generateContent')
    );

    return NextResponse.json({
      success: true,
      totalModels: modelsList.length,
      generateContentModels: generateContentModels.length,
      models: generateContentModels,
      allModels: modelsList,
    });
  } catch (error) {
    console.error('Error listing models:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to list models',
      },
      { status: 500 }
    );
  }
}
