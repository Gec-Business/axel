import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getPost, updatePost, addAuditLog, getAssetsByIds } from '@/lib/supabase';
import { publishPost } from '@/lib/social-publisher';
import { buildCaption } from '@/lib/utils';
import type { Platform } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, platform } = await request.json() as { id: string; platform: Platform };
  if (!id || !platform) {
    return NextResponse.json({ error: 'id and platform are required' }, { status: 400 });
  }

  const post = await getPost(id);
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  if (post.status !== 'approved' && post.status !== 'draft') {
    return NextResponse.json({ error: `Cannot publish post with status "${post.status}"` }, { status: 400 });
  }

  // Check if already posted on this platform
  if (post.publish_results?.[platform]?.posted) {
    return NextResponse.json({ error: `Already posted to ${platform}` }, { status: 409 });
  }

  // Resolve assets
  const assetIds = post.asset_ids ?? [];
  const assets = assetIds.length > 0 ? await getAssetsByIds(assetIds) : [];
  const imageUrls = assets.filter(a => a.mime_type.startsWith('image/')).map(a => a.public_url).filter(Boolean) as string[];
  const videoAsset = assets.find(a => a.mime_type.startsWith('video/'));

  const caption = buildCaption(post, platform);

  const result = await publishPost(platform, caption, post.content_type, {
    imageUrl: imageUrls[0],
    imageUrls,
    videoUrl: videoAsset?.public_url,
  });

  // Update publish results
  const publishResults = { ...(post.publish_results || {}) };
  publishResults[platform] = {
    posted: result.success,
    posted_at: new Date().toISOString(),
    post_id: result.postId,
    error: result.error,
    auto_posted: false,
  };

  // Check if all platforms are done
  const allPlatformsDone = post.platforms.every(
    p => publishResults[p]?.posted,
  );

  await updatePost(id, {
    publish_results: publishResults,
    status: allPlatformsDone ? 'posted' : post.status,
  });

  await addAuditLog(result.success ? 'post_published' : 'post_failed', 'post', id, {
    platform,
    post_id: result.postId,
    error: result.error,
    manual: true,
  });

  return NextResponse.json(result);
}
