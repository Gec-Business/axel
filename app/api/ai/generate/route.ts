import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { generateContentBatch } from '@/lib/ai-generator';
import { addAuditLog, getSettings, setSetting } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const MAX_GENERATIONS_PER_DAY = 10;

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  // Rate limit: max 10 generations per day
  const today = new Date().toISOString().slice(0, 10);
  const rlKey = `ai_ratelimit_${today}`;
  const rlCount = ((await getSettings(rlKey)) as number) || 0;

  if (rlCount >= MAX_GENERATIONS_PER_DAY) {
    return NextResponse.json(
      { error: `Daily AI generation limit reached (${MAX_GENERATIONS_PER_DAY}/day). Try again tomorrow.` },
      { status: 429 },
    );
  }

  await setSetting(rlKey, rlCount + 1);

  const body = await request.json();

  try {
    const posts = await generateContentBatch({
      pillar: body.pillar,
      campaignId: body.campaignId,
      campaignName: body.campaignName,
      dateRange: body.dateRange,
      postsPerWeek: body.postsPerWeek || 3,
      platforms: body.platforms || ['facebook', 'instagram', 'linkedin'],
      contentTypes: body.contentTypes || ['image_post'],
      context: body.context,
      targetAudience: body.targetAudience,
    });

    await addAuditLog('ai_generated', 'post', undefined, {
      pillar: body.pillar,
      count: posts.length,
      dateRange: body.dateRange,
    });

    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
