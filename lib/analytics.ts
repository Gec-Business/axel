// ---------------------------------------------------------------------------
// Post-publish engagement metrics
// ---------------------------------------------------------------------------

const GRAPH_API = 'https://graph.facebook.com/v25.0';
const LINKEDIN_API = 'https://api.linkedin.com';
const LINKEDIN_VERSION = '202602';

export interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
  reach?: number;
  impressions?: number;
}

// ---------------------------------------------------------------------------
// Facebook
// ---------------------------------------------------------------------------

export async function fetchFacebookMetrics(
  postId: string,
): Promise<PostMetrics | null> {
  try {
    const token = process.env.META_PAGE_TOKEN;
    if (!token) {
      throw new Error('Missing META_PAGE_TOKEN environment variable');
    }

    const fields = 'likes.summary(true),comments.summary(true),shares';
    const url = `${GRAPH_API}/${postId}?fields=${fields}&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Facebook API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as Record<string, unknown>;

    const likesSummary = (data.likes as Record<string, unknown>)?.summary as
      | Record<string, number>
      | undefined;
    const commentsSummary = (data.comments as Record<string, unknown>)
      ?.summary as Record<string, number> | undefined;
    const sharesData = data.shares as Record<string, number> | undefined;

    return {
      likes: likesSummary?.total_count ?? 0,
      comments: commentsSummary?.total_count ?? 0,
      shares: sharesData?.count ?? 0,
    };
  } catch (err) {
    console.error('fetchFacebookMetrics error:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Instagram
// ---------------------------------------------------------------------------

export async function fetchInstagramMetrics(
  postId: string,
): Promise<PostMetrics | null> {
  try {
    const token = process.env.META_PAGE_TOKEN;
    if (!token) {
      throw new Error('Missing META_PAGE_TOKEN environment variable');
    }

    // Basic engagement counts
    const basicUrl = `${GRAPH_API}/${postId}?fields=like_count,comments_count&access_token=${token}`;
    const basicRes = await fetch(basicUrl);
    if (!basicRes.ok) {
      throw new Error(
        `Instagram API error: ${basicRes.status} ${basicRes.statusText}`,
      );
    }

    const basicData = (await basicRes.json()) as Record<string, unknown>;

    const metrics: PostMetrics = {
      likes: Number(basicData.like_count ?? 0),
      comments: Number(basicData.comments_count ?? 0),
      shares: 0, // Instagram API does not expose share counts
    };

    // Try to get reach and impressions via the insights endpoint
    try {
      const insightsUrl =
        `${GRAPH_API}/${postId}/insights?metric=reach,impressions&access_token=${token}`;
      const insightsRes = await fetch(insightsUrl);

      if (insightsRes.ok) {
        const insightsData = (await insightsRes.json()) as Record<
          string,
          unknown
        >;
        const dataArray = insightsData.data as
          | Array<Record<string, unknown>>
          | undefined;

        if (dataArray) {
          for (const entry of dataArray) {
            const name = entry.name as string;
            const values = entry.values as
              | Array<Record<string, number>>
              | undefined;
            const value = values?.[0]?.value ?? 0;

            if (name === 'reach') {
              metrics.reach = value;
            } else if (name === 'impressions') {
              metrics.impressions = value;
            }
          }
        }
      }
    } catch {
      // Insights may not be available for all post types; proceed without them
    }

    return metrics;
  } catch (err) {
    console.error('fetchInstagramMetrics error:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// LinkedIn
// ---------------------------------------------------------------------------

export async function fetchLinkedInMetrics(
  postId: string,
  accessToken: string,
): Promise<PostMetrics | null> {
  try {
    // Use socialMetadata API (socialActions is deprecated)
    const encodedPostId = encodeURIComponent(postId);
    const url = `${LINKEDIN_API}/rest/socialMetadata/${encodedPostId}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': LINKEDIN_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!res.ok) {
      // Fallback to socialActions if socialMetadata not available
      const fallbackUrl = `${LINKEDIN_API}/rest/socialActions/${encodedPostId}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': LINKEDIN_VERSION,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });
      if (!fallbackRes.ok) {
        throw new Error(`LinkedIn API error: ${res.status}`);
      }
      const fallbackData = (await fallbackRes.json()) as Record<string, unknown>;
      const likesData = fallbackData.likesSummary as Record<string, number> | undefined;
      const commentsData = fallbackData.commentsSummary as Record<string, number> | undefined;
      return {
        likes: likesData?.totalLikes ?? 0,
        comments: commentsData?.totalFirstLevelComments ?? commentsData?.totalComments ?? 0,
        shares: 0, // Not available via socialActions
      };
    }

    const data = (await res.json()) as Record<string, unknown>;
    const reactionSummary = data.reactionSummary as Record<string, number> | undefined;
    const commentSummary = data.commentSummary as Record<string, number> | undefined;
    const shareSummary = data.shareSummary as Record<string, number> | undefined;

    return {
      likes: reactionSummary?.totalCount ?? 0,
      comments: commentSummary?.totalFirstLevelComments ?? 0,
      shares: shareSummary?.totalCount ?? 0,
    };
  } catch (err) {
    console.error('fetchLinkedInMetrics error:', err);
    return null;
  }
}
