import Anthropic from '@anthropic-ai/sdk';
import { AXEL_BRAND_VOICE } from './brand-voice';
import { ContentPillar, ContentType, Platform } from './constants';

export interface AIGenerationRequest {
  pillar: ContentPillar;
  campaignId?: string;
  campaignName?: string;
  dateRange: { start: string; end: string };
  postsPerWeek: number;
  platforms: Platform[];
  contentTypes: ContentType[];
  context?: string;
  targetAudience?: string;
}

export interface GeneratedPost {
  scheduled_date: string;
  platforms: Platform[];
  content_type: ContentType;
  pillar: ContentPillar;
  topic: string;
  goal: string;
  copy_ka: string;
  copy_en: string;
  copy_ka_linkedin?: string;
  copy_en_linkedin?: string;
  copy_ka_instagram?: string;
  copy_en_instagram?: string;
  hashtags: string[];
  hashtags_instagram?: string[];
  hashtags_linkedin?: string[];
  suggested_time?: string;
}

const POSTING_TIME_RECOMMENDATIONS: Record<string, string> = {
  linkedin: '09:00-10:00 or 17:00-18:00 Tbilisi time (best for professional audience engagement)',
  instagram: '12:00-14:00 or 19:00-21:00 Tbilisi time (peak visual content consumption)',
  facebook: '10:00-12:00 or 18:00-20:00 Tbilisi time (balanced reach across demographics)',
};

function buildSystemPrompt(request: AIGenerationRequest): string {
  const pillarGuidelines = AXEL_BRAND_VOICE.pillarGuidelines?.[request.pillar] ?? '';
  const pillarHashtags = AXEL_BRAND_VOICE.hashtagSets?.[request.pillar] ?? [];
  const doNotRules = AXEL_BRAND_VOICE.doNot ?? [];
  const toneRules = AXEL_BRAND_VOICE.tone ?? [];

  return `You are the social media content strategist for Axel Network — Georgia's premier angel investor network. Your role is to create compelling, bilingual social media content that positions Axel Network as the leading force in the Georgian startup and angel investing ecosystem.

## BRAND IDENTITY
Axel Network connects angel investors with promising Georgian startups, facilitating deal flow, due diligence, and co-investment opportunities. The brand is authoritative yet approachable, data-informed but human, and deeply rooted in the Georgian entrepreneurial community while maintaining international credibility.

## TONE & VOICE RULES
${toneRules.map((rule: string) => `- ${rule}`).join('\n')}

## CONTENT PILLAR: ${request.pillar}
${pillarGuidelines}

## LANGUAGE GUIDELINES

### Georgian (ქართული)
- Write naturally in Georgian, not as a translation from English.
- Use professional Georgian business vocabulary. Avoid overly academic or bureaucratic language.
- Georgian copy should feel native — as if written by a Georgian communications professional.
- Use Georgian punctuation conventions correctly.
- When referencing English-origin startup terminology (e.g., "startup", "pitch", "exit"), use the commonly accepted Georgian transliteration or the English word in Latin script if that is standard practice in the Georgian startup ecosystem.
- Georgian copy is ALWAYS the primary copy — it appears first.

### English
- Clean, confident, professional English suitable for an international investor audience.
- Avoid jargon overload. Be specific rather than generic.
- English copy should complement the Georgian, not be a literal translation. Adapt the message for an English-speaking audience that may not have Georgian context.

## CAPTION STRUCTURE
Every post MUST follow this structure:
1. Georgian copy (copy_ka) — the primary message
2. Separator: ---
3. English copy (copy_en) — adapted (not literally translated) for English audience
4. Hashtags at the end

## PER-PLATFORM VARIATION INSTRUCTIONS
When generating platform-specific copy overrides, follow these rules:

### LinkedIn
- More professional and formal tone
- Longer, more detailed captions are acceptable (up to 1300 characters)
- Use industry-specific language and data points
- Include a clear call to action relevant to professionals (e.g., "Join our next pitch night", "Connect with us")
- Fewer emojis — use sparingly if at all (max 1-2)
- Hashtags: 3-5 relevant professional hashtags
- Best posting times: ${POSTING_TIME_RECOMMENDATIONS.linkedin}

### Instagram
- More visual and casual tone
- Shorter, punchier captions (300-500 characters ideal, max 2200)
- Use emojis strategically to break up text and add personality (3-6 per post)
- Include a hook in the first line (this shows before "...more")
- Use line breaks for readability
- Hashtags: 10-15 relevant hashtags mixing broad and niche
- Include a call to action that drives engagement (e.g., "Double-tap if you agree", "Tag a founder who needs to see this")
- Best posting times: ${POSTING_TIME_RECOMMENDATIONS.instagram}

### Facebook
- Balanced tone — professional but conversational
- Medium-length captions (400-800 characters)
- Moderate emoji use (2-4)
- Encourage community interaction (questions, polls, shares)
- Hashtags: 3-7 relevant hashtags
- Best posting times: ${POSTING_TIME_RECOMMENDATIONS.facebook}

## PILLAR-SPECIFIC HASHTAGS
${pillarHashtags.length > 0 ? pillarHashtags.map((tag: string) => `${tag}`).join(' ') : 'Use hashtags relevant to the content pillar and Georgian startup ecosystem.'}

Always include these base hashtags where relevant: #AxelNetwork #GeorgianStartups #AngelInvesting #StartupGeorgia

## DO NOT
${doNotRules.map((rule: string) => `- ${rule}`).join('\n')}
${doNotRules.length === 0 ? `- Do NOT use generic motivational quotes without tying them to Axel Network's mission
- Do NOT make unsubstantiated claims about investment returns or guarantees
- Do NOT use clickbait or sensationalist language
- Do NOT post content that could be construed as financial advice
- Do NOT use AI-sounding phrases like "In today's fast-paced world" or "Let's dive in"
- Do NOT copy competitor messaging or reference competitors negatively
- Do NOT use stock-photo-caption style writing
- Do NOT mix Georgian and English within the same section (keep them cleanly separated)` : ''}

## OUTPUT FORMAT
Return a JSON array of post objects. Each object must have these fields:
- scheduled_date: ISO date string (YYYY-MM-DD)
- platforms: array of platform strings matching the requested platforms
- content_type: one of the requested content types
- pillar: "${request.pillar}"
- topic: brief topic description (English)
- goal: what this post aims to achieve (English)
- copy_ka: Georgian caption text
- copy_en: English caption text
- hashtags: array of hashtag strings (default set)
- suggested_time: recommended posting time in HH:MM format (Asia/Tbilisi timezone)

If multiple platforms are requested AND platform-specific copy is beneficial, also include:
- copy_ka_linkedin / copy_en_linkedin: LinkedIn-optimized Georgian/English copy
- copy_ka_instagram / copy_en_instagram: Instagram-optimized Georgian/English copy
- hashtags_instagram: Instagram-specific hashtag array (more hashtags)
- hashtags_linkedin: LinkedIn-specific hashtag array (fewer, more professional)

Only include platform-specific overrides when the copy genuinely differs. If the default copy works well for all platforms, omit the overrides to avoid redundancy.

Return ONLY the JSON array, no markdown fences, no explanation text.`;
}

function buildUserPrompt(request: AIGenerationRequest): string {
  const parts: string[] = [];

  parts.push(`Generate a batch of social media posts for Axel Network.`);
  parts.push(`\nContent Pillar: ${request.pillar}`);

  if (request.campaignName) {
    parts.push(`Campaign: ${request.campaignName}`);
  }

  parts.push(`Date Range: ${request.dateRange.start} to ${request.dateRange.end}`);
  parts.push(`Posts Per Week: ${request.postsPerWeek}`);
  parts.push(`Platforms: ${request.platforms.join(', ')}`);
  parts.push(`Content Types: ${request.contentTypes.join(', ')}`);

  if (request.targetAudience) {
    parts.push(`\nTarget Audience: ${request.targetAudience}`);
  }

  if (request.context) {
    parts.push(`\nAdditional Context & Instructions:\n${request.context}`);
  }

  // Calculate expected number of posts
  const startDate = new Date(request.dateRange.start);
  const endDate = new Date(request.dateRange.end);
  const weeks = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  const totalPosts = weeks * request.postsPerWeek;

  parts.push(`\nPlease generate exactly ${totalPosts} posts (${request.postsPerWeek} per week for ${weeks} week${weeks > 1 ? 's' : ''}).`);
  parts.push(`Distribute the scheduled_date values evenly across the date range.`);
  parts.push(`Vary the content types across: ${request.contentTypes.join(', ')}.`);
  parts.push(`Each post should have a distinct topic and angle — avoid repetition.`);

  return parts.join('\n');
}

function extractJsonArray(text: string): GeneratedPost[] {
  // Try direct parse first
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.posts)) return parsed.posts;
  } catch {
    // Fall through to extraction attempts
  }

  // Try to extract JSON array from the response text
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      // Fall through
    }
  }

  // Try to extract from markdown code fence
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fall through
    }
  }

  console.error('[ai-generator] Failed to extract JSON array from response');
  return [];
}

export async function generateContentBatch(
  request: AIGenerationRequest
): Promise<GeneratedPost[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[ai-generator] ANTHROPIC_API_KEY is not set');
    return [];
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = buildSystemPrompt(request);
  const userPrompt = buildUserPrompt(request);

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      console.error('[ai-generator] No text content in API response');
      return [];
    }

    const posts = extractJsonArray(textBlock.text);

    if (posts.length === 0) {
      console.warn('[ai-generator] Parsed 0 posts from API response');
    } else {
      console.log(`[ai-generator] Generated ${posts.length} posts for pillar: ${request.pillar}`);
    }

    return posts;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(
        `[ai-generator] Anthropic API error: ${error.status} ${error.message}`
      );
    } else if (error instanceof Error) {
      console.error(`[ai-generator] Error: ${error.message}`);
    } else {
      console.error('[ai-generator] Unknown error during content generation');
    }
    return [];
  }
}
