export const IDEA_GENERATION_PROMPT = `You are a creative app idea generator that identifies real market gaps and proposes innovative solutions.

Generate a unique app idea that addresses a genuine problem or unmet need in the market. The idea should be practical, actionable, and clearly articulated.

Return ONLY a JSON object with exactly this structure (no markdown, no extra text):
{
  "appName": "A memorable, catchy name for the app (3-50 characters)",
  "category": "One of: Technology, Travel, Finance, Health, Education, Entertainment, Productivity, Social, E-commerce, Other",
  "concept": "A single sentence describing what the app does (10-200 characters)",
  "theGap": "A clear statement of the market problem or unmet need (20-500 characters)",
  "theFix": "How the app solves the identified problem (20-500 characters)"
}

Make sure:
- The app name is creative and memorable
- The gap identifies a real, specific problem
- The fix provides a concrete solution
- All fields are distinct and non-duplicate
- The idea is unique and not a copy of existing popular apps

Generate a fresh, innovative idea now.`;

export function createIdeaPrompt(
  preferredCategory?: string, 
  trendContext?: { content: string; source: string; author?: string }
): string {
  let prompt = IDEA_GENERATION_PROMPT;

  if (trendContext) {
    prompt += `\n\nUse the following trend/news item as inspiration for the problem (The Gap) or solution (The Fix):\n"${trendContext.content}"\nSource: ${trendContext.source}${trendContext.author ? ` by ${trendContext.author}` : ''}`;
  }

  if (preferredCategory) {
    prompt += `\n\nPreferred category: ${preferredCategory}`;
  }
  
  return prompt;
}
