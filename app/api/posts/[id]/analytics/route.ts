import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getPost } from '@/lib/supabase';
import { fetchFacebookMetrics, fetchInstagramMetrics, fetchLinkedInMetrics } from '@/lib/analytics';
import { getValidLinkedInToken } from '@/lib/linkedin-tokens-supabase';
import type { Platform } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPost(id);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.status !== 'posted' || !post.publish_results) {
    return NextResponse.json({ error: 'Post has not been published yet' }, { status: 400 });
  }

  const analytics: Record<string, unknown> = {};

  for (const platform of Object.keys(post.publish_results) as Platform[]) {
    const result = post.publish_results[platform];
    if (!result?.posted || !result.post_id) continue;

    try {
      if (platform === 'facebook') {
        analytics.facebook = await fetchFacebookMetrics(result.post_id);
      } else if (platform === 'instagram') {
        analytics.instagram = await fetchInstagramMetrics(result.post_id);
      } else if (platform === 'linkedin') {
        const token = await getValidLinkedInToken();
        if (token) {
          analytics.linkedin = await fetchLinkedInMetrics(result.post_id, token);
        }
      }
    } catch {
      analytics[platform] = null;
    }
  }

  return NextResponse.json(analytics);
}
