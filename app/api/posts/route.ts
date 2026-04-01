import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllPosts, createPost, addAuditLog } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters = {
    status: searchParams.get('status') || undefined,
    pillar: searchParams.get('pillar') || undefined,
    campaign_id: searchParams.get('campaignId') || undefined,
    date_from: searchParams.get('dateFrom') || undefined,
    date_to: searchParams.get('dateTo') || undefined,
    platform: searchParams.get('platform') || undefined,
  };

  const posts = await getAllPosts(filters);
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const post = await createPost({
    scheduled_date: body.scheduled_date,
    scheduled_time: body.scheduled_time || null,
    platforms: body.platforms || [],
    content_type: body.content_type || 'image_post',
    pillar: body.pillar || 'general',
    topic: body.topic || '',
    goal: body.goal || '',
    copy_ka: body.copy_ka || '',
    copy_en: body.copy_en || '',
    hashtags: body.hashtags || [],
    utm_link: body.utm_link || null,
    notes: body.notes || null,
    copy_ka_facebook: body.copy_ka_facebook || null,
    copy_en_facebook: body.copy_en_facebook || null,
    copy_ka_instagram: body.copy_ka_instagram || null,
    copy_en_instagram: body.copy_en_instagram || null,
    copy_ka_linkedin: body.copy_ka_linkedin || null,
    copy_en_linkedin: body.copy_en_linkedin || null,
    hashtags_facebook: body.hashtags_facebook || null,
    hashtags_instagram: body.hashtags_instagram || null,
    hashtags_linkedin: body.hashtags_linkedin || null,
    asset_ids: body.asset_ids || [],
    status: 'draft',
    campaign_id: body.campaign_id || null,
    ai_generated: body.ai_generated || false,
  });

  if (post) {
    await addAuditLog('post_created', 'post', post.id);
  }

  return NextResponse.json(post, { status: 201 });
}
