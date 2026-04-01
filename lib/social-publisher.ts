import { Platform, ContentType } from './constants';
import { getValidLinkedInToken } from './linkedin-tokens-supabase';

const GRAPH_API = 'https://graph.facebook.com/v25.0';
const LINKEDIN_API = 'https://api.linkedin.com';
const LINKEDIN_VERSION = '202602';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function downloadToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

// ---------------------------------------------------------------------------
// Facebook
// ---------------------------------------------------------------------------

async function postToFacebook(
  message: string,
  imageUrl?: string,
): Promise<PublishResult> {
  try {
    const pageId = env('META_PAGE_ID');
    const token = env('META_PAGE_TOKEN');

    let endpoint: string;
    let body: Record<string, string>;

    if (imageUrl) {
      endpoint = `${GRAPH_API}/${pageId}/photos`;
      body = {
        url: imageUrl,
        message,
        access_token: token,
      };
    } else {
      endpoint = `${GRAPH_API}/${pageId}/feed`;
      body = {
        message,
        access_token: token,
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      throw new Error(
        (data.error as Record<string, string>)?.message ??
          `Facebook API error: ${res.status}`,
      );
    }

    return { success: true, postId: String(data.id ?? data.post_id ?? '') };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

async function postVideoToFacebook(
  description: string,
  videoUrl: string,
): Promise<PublishResult> {
  try {
    const pageId = env('META_PAGE_ID');
    const token = env('META_PAGE_TOKEN');
    const videoBuffer = await downloadToBuffer(videoUrl);
    const fileSize = videoBuffer.length;

    // 1. Start a resumable upload session
    const startRes = await fetch(`${GRAPH_API}/${pageId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_phase: 'start',
        file_size: fileSize,
        access_token: token,
      }),
    });

    const startData = (await startRes.json()) as Record<string, unknown>;
    if (!startRes.ok) {
      throw new Error(
        `Failed to start upload session: ${JSON.stringify(startData)}`,
      );
    }

    const uploadSessionId = String(startData.upload_session_id);
    const chunkSize = 4 * 1024 * 1024; // 4 MB chunks
    let startOffset = Number(startData.start_offset ?? 0);
    let endOffset = Number(startData.end_offset ?? chunkSize);

    // 2. Upload chunks in a loop
    while (startOffset < fileSize) {
      const chunk = videoBuffer.subarray(startOffset, endOffset);

      const formData = new FormData();
      formData.append('upload_phase', 'transfer');
      formData.append('upload_session_id', uploadSessionId);
      formData.append('start_offset', String(startOffset));
      formData.append('access_token', token);
      formData.append(
        'video_file_chunk',
        new Blob([chunk]),
        'chunk.mp4',
      );

      const transferRes = await fetch(`${GRAPH_API}/${pageId}/videos`, {
        method: 'POST',
        body: formData,
      });

      const transferData = (await transferRes.json()) as Record<string, unknown>;
      if (!transferRes.ok) {
        throw new Error(
          `Chunk upload failed at offset ${startOffset}: ${JSON.stringify(transferData)}`,
        );
      }

      startOffset = Number(transferData.start_offset);
      endOffset = Number(transferData.end_offset);
    }

    // 3. Finish the upload
    const finishRes = await fetch(`${GRAPH_API}/${pageId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_phase: 'finish',
        upload_session_id: uploadSessionId,
        description,
        access_token: token,
      }),
    });

    const finishData = (await finishRes.json()) as Record<string, unknown>;
    if (!finishRes.ok) {
      throw new Error(
        `Failed to finish upload: ${JSON.stringify(finishData)}`,
      );
    }

    return { success: true, postId: String(finishData.id ?? '') };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Instagram
// ---------------------------------------------------------------------------

function igId(): string {
  return env('META_IG_ACCOUNT_ID');
}

function igToken(): string {
  return env('META_PAGE_TOKEN');
}

async function igCreateContainer(
  imageUrl: string,
  caption?: string,
  isCarouselItem?: boolean,
): Promise<string> {
  const params: Record<string, string> = {
    image_url: imageUrl,
    access_token: igToken(),
  };
  if (caption) params.caption = caption;
  if (isCarouselItem) params.is_carousel_item = 'true';

  const res = await fetch(`${GRAPH_API}/${igId()}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      `igCreateContainer failed: ${JSON.stringify(data)}`,
    );
  }

  return String(data.id);
}

async function igCreateReelContainer(
  videoUrl: string,
  caption: string,
): Promise<string> {
  const res = await fetch(`${GRAPH_API}/${igId()}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'REELS',
      video_url: videoUrl,
      caption,
      access_token: igToken(),
    }),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      `igCreateReelContainer failed: ${JSON.stringify(data)}`,
    );
  }

  return String(data.id);
}

async function igCheckContainerStatus(
  containerId: string,
): Promise<string> {
  const url = `${GRAPH_API}/${containerId}?fields=status_code&access_token=${igToken()}`;
  const res = await fetch(url);
  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    throw new Error(
      `igCheckContainerStatus failed: ${JSON.stringify(data)}`,
    );
  }

  return String(data.status_code);
}

async function igCreateCarouselContainer(
  childIds: string[],
  caption: string,
): Promise<string> {
  const res = await fetch(`${GRAPH_API}/${igId()}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption,
      access_token: igToken(),
    }),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      `igCreateCarouselContainer failed: ${JSON.stringify(data)}`,
    );
  }

  return String(data.id);
}

async function igPublish(containerId: string): Promise<string> {
  // Poll container status before publishing (more reliable than hardcoded wait)
  await igWaitForProcessing(containerId, 30_000);

  const res = await fetch(`${GRAPH_API}/${igId()}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: igToken(),
    }),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(`igPublish failed: ${JSON.stringify(data)}`);
  }

  return String(data.id);
}

async function igWaitForProcessing(
  containerId: string,
  maxWaitMs: number = 60000,
): Promise<void> {
  const pollIntervalMs = 3000;
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    const status = await igCheckContainerStatus(containerId);

    if (status === 'FINISHED') {
      return;
    }

    if (status === 'ERROR') {
      throw new Error(
        `Container ${containerId} processing failed with status ERROR`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(
    `Container ${containerId} processing timed out after ${maxWaitMs}ms`,
  );
}

async function postToInstagram(
  caption: string,
  imageUrls: string[],
): Promise<PublishResult> {
  try {
    if (!imageUrls.length) {
      return { success: false, error: 'At least one image URL is required for Instagram' };
    }

    const urls = imageUrls.slice(0, 10); // Max 10 carousel slides

    if (urls.length === 1) {
      // Single image post
      const containerId = await igCreateContainer(urls[0], caption);
      const postId = await igPublish(containerId);
      return { success: true, postId };
    }

    // Carousel post (2-10 images)
    const childIds: string[] = [];
    for (const url of urls) {
      const childId = await igCreateContainer(url, undefined, true);
      childIds.push(childId);
    }

    const carouselId = await igCreateCarouselContainer(childIds, caption);
    const postId = await igPublish(carouselId);
    return { success: true, postId };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

async function postReelToInstagram(
  caption: string,
  videoUrl: string,
): Promise<PublishResult> {
  try {
    const containerId = await igCreateReelContainer(videoUrl, caption);
    await igWaitForProcessing(containerId);
    const postId = await igPublish(containerId);
    return { success: true, postId };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// LinkedIn
// ---------------------------------------------------------------------------

function getLinkedInOrgUrn(): string {
  const orgId = env('LINKEDIN_ORG_ID');
  return `urn:li:organization:${orgId}`;
}

async function liUploadImage(
  token: string,
  ownerUrn: string,
  imageUrl: string,
): Promise<string> {
  // 1. Initialize upload
  const initRes = await fetch(
    `${LINKEDIN_API}/rest/images?action=initializeUpload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': LINKEDIN_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: ownerUrn,
        },
      }),
    },
  );

  const initData = (await initRes.json()) as Record<string, unknown>;
  if (!initRes.ok) {
    throw new Error(
      `LinkedIn image upload init failed: ${JSON.stringify(initData)}`,
    );
  }

  const value = initData.value as Record<string, string>;
  const uploadUrl = value.uploadUrl;
  const imageUrn = value.image;

  // 2. Download the image
  const imageBuffer = await downloadToBuffer(imageUrl);

  // 3. PUT the image bytes to the upload URL
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
    },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    throw new Error(
      `LinkedIn image upload PUT failed: ${uploadRes.status} ${uploadRes.statusText}`,
    );
  }

  return imageUrn;
}

async function liUploadVideo(
  token: string,
  ownerUrn: string,
  videoUrl: string,
): Promise<string> {
  const videoBuffer = await downloadToBuffer(videoUrl);
  const fileSize = videoBuffer.length;

  // 1. Initialize upload
  const initRes = await fetch(
    `${LINKEDIN_API}/rest/videos?action=initializeUpload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': LINKEDIN_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: ownerUrn,
          fileSizeBytes: fileSize,
        },
      }),
    },
  );

  const initData = (await initRes.json()) as Record<string, unknown>;
  if (!initRes.ok) {
    throw new Error(
      `LinkedIn video upload init failed: ${JSON.stringify(initData)}`,
    );
  }

  const value = initData.value as Record<string, unknown>;
  const videoUrn = String(value.video);
  const uploadInstructions = value.uploadInstructions as Array<{
    uploadUrl: string;
    firstByte: number;
    lastByte: number;
  }>;

  // 2. Upload chunks per instructions
  for (const instruction of uploadInstructions) {
    const chunk = videoBuffer.subarray(
      instruction.firstByte,
      instruction.lastByte + 1,
    );

    const uploadRes = await fetch(instruction.uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
      },
      body: chunk,
    });

    if (!uploadRes.ok) {
      throw new Error(
        `LinkedIn video chunk upload failed at byte ${instruction.firstByte}: ${uploadRes.status}`,
      );
    }
  }

  // 3. Finalize upload
  const finalizeRes = await fetch(
    `${LINKEDIN_API}/rest/videos?action=finalizeUpload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': LINKEDIN_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        finalizeUploadRequest: {
          video: videoUrn,
        },
      }),
    },
  );

  if (!finalizeRes.ok) {
    const errData = await finalizeRes.json();
    throw new Error(
      `LinkedIn video finalize failed: ${JSON.stringify(errData)}`,
    );
  }

  return videoUrn;
}

async function postToLinkedIn(
  caption: string,
  opts?: { imageUrl?: string; videoUrl?: string },
): Promise<PublishResult> {
  try {
    const token = await getValidLinkedInToken();
    if (!token) {
      return { success: false, error: 'No valid LinkedIn access token available' };
    }

    const orgUrn = getLinkedInOrgUrn();

    // Build the post body
    const postBody: Record<string, unknown> = {
      author: orgUrn,
      commentary: caption,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
    };

    // Optionally upload and attach media
    if (opts?.videoUrl) {
      const videoUrn = await liUploadVideo(token, orgUrn, opts.videoUrl);
      postBody.content = {
        media: {
          id: videoUrn,
          title: caption.substring(0, 100),
        },
      };
    } else if (opts?.imageUrl) {
      const imageUrn = await liUploadImage(token, orgUrn, opts.imageUrl);
      postBody.content = {
        media: {
          id: imageUrn,
          title: caption.substring(0, 100),
        },
      };
    }

    const res = await fetch(`${LINKEDIN_API}/rest/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': LINKEDIN_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postBody),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(
        `LinkedIn post failed: ${JSON.stringify(errData)}`,
      );
    }

    const postId = res.headers.get('x-restli-id') ?? '';
    return { success: true, postId };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function publishPost(
  platform: Platform,
  caption: string,
  contentType: ContentType,
  opts: {
    imageUrl?: string;
    imageUrls?: string[];
    videoUrl?: string;
  },
): Promise<PublishResult> {
  try {
    switch (platform) {
      case 'facebook': {
        if (contentType === 'video' && opts.videoUrl) {
          return await postVideoToFacebook(caption, opts.videoUrl);
        }
        return await postToFacebook(caption, opts.imageUrl);
      }

      case 'instagram': {
        if (contentType === 'video' || contentType === 'reel') {
          if (!opts.videoUrl) {
            return { success: false, error: 'videoUrl is required for Instagram video/reel' };
          }
          return await postReelToInstagram(caption, opts.videoUrl);
        }

        if (contentType === 'carousel' && opts.imageUrls && opts.imageUrls.length >= 2) {
          return await postToInstagram(caption, opts.imageUrls);
        }

        if (opts.imageUrl) {
          return await postToInstagram(caption, [opts.imageUrl]);
        }

        if (opts.imageUrls && opts.imageUrls.length > 0) {
          return await postToInstagram(caption, opts.imageUrls);
        }

        return { success: false, error: 'Instagram requires at least one image or video' };
      }

      case 'linkedin': {
        if (contentType === 'video' && opts.videoUrl) {
          return await postToLinkedIn(caption, { videoUrl: opts.videoUrl });
        }
        return await postToLinkedIn(caption, { imageUrl: opts.imageUrl });
      }

      default:
        return { success: false, error: `Unsupported platform: ${platform}` };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
