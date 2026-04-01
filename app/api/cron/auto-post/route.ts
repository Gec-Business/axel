import { NextRequest, NextResponse } from 'next/server';
import { getApprovedPostsForToday, updatePost, getAssetsByIds, addAuditLog } from '@/lib/supabase';
import { publishPost } from '@/lib/social-publisher';
import { buildCaption, getTodayDate } from '@/lib/utils';
import { SITE_CONFIG } from '@/lib/config';
import type { Platform, Post } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Validate cron secret
  const cronSecret = request.headers.get('x-cron-secret');
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Invalid cron secret' }, { status: 401 });
  }

  const today = getTodayDate(SITE_CONFIG.timezone);
  const posts = await getApprovedPostsForToday(today);

  const results: { postId: string; platform: string; success: boolean; error?: string }[] = [];
  const skipped: string[] = [];

  for (const post of posts) {
    // Atomically claim the post by setting status to 'publishing'
    const claimed = await updatePost(post.id, { status: 'publishing' });
    if (!claimed) {
      skipped.push(`${post.id} — failed to claim`);
      continue;
    }

    // Resolve assets
    const assets = post.asset_ids.length > 0 ? await getAssetsByIds(post.asset_ids) : [];
    const imageUrls = assets.filter(a => a.mime_type.startsWith('image/')).map(a => a.public_url);
    const videoAsset = assets.find(a => a.mime_type.startsWith('video/'));

    const publishResults = { ...(post.publish_results || {}) };
    let allSucceeded = true;

    for (const platform of post.platforms as Platform[]) {
      // Skip if already posted on this platform
      if (publishResults[platform]?.posted) {
        skipped.push(`${post.id}/${platform} — already posted`);
        continue;
      }

      const caption = buildCaption(post as Post, platform);

      const result = await publishPost(platform, caption, post.content_type, {
        imageUrl: imageUrls[0],
        imageUrls,
        videoUrl: videoAsset?.public_url,
      });

      publishResults[platform] = {
        posted: result.success,
        posted_at: new Date().toISOString(),
        post_id: result.postId,
        error: result.error,
        auto_posted: true,
      };

      results.push({
        postId: post.id,
        platform,
        success: result.success,
        error: result.error,
      });

      if (!result.success) allSucceeded = false;

      await addAuditLog(
        result.success ? 'post_published' : 'post_failed',
        'post',
        post.id,
        { platform, post_id: result.postId, error: result.error, auto: true },
      );
    }

    // Update final status
    const allPlatformsDone = post.platforms.every(
      (p: string) => publishResults[p as Platform]?.posted,
    );

    await updatePost(post.id, {
      publish_results: publishResults,
      status: allPlatformsDone ? 'posted' : allSucceeded ? 'posted' : 'failed',
    });
  }

  return NextResponse.json({
    date: today,
    postsProcessed: posts.length,
    results,
    skipped,
  });
}
