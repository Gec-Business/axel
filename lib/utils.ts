import { SITE_CONFIG } from '@/lib/config';
import type { Post, Platform } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Caption builder                                                   */
/* ------------------------------------------------------------------ */

/**
 * Build the full caption for a post on a given platform.
 * Uses per-platform copy overrides when available, otherwise falls back
 * to the default copy fields.
 */
export function buildCaption(post: Post, platform: Platform): string {
  const kaKey = `copy_ka_${platform}` as keyof Post;
  const enKey = `copy_en_${platform}` as keyof Post;
  const hashtagKey = `hashtags_${platform}` as keyof Post;

  const copyKa = (post[kaKey] as string | undefined) || post.copy_ka;
  const copyEn = (post[enKey] as string | undefined) || post.copy_en;
  const hashtags =
    (post[hashtagKey] as string[] | undefined) || post.hashtags || [];

  const utmLink = buildUtmLink(
    SITE_CONFIG.campaignLink,
    post.campaign_id,
  );

  const parts: string[] = [];

  if (copyKa) parts.push(copyKa);
  if (copyEn) {
    if (parts.length > 0) parts.push('---');
    parts.push(copyEn);
  }
  if (utmLink) parts.push(utmLink);
  if (hashtags.length > 0) parts.push(hashtags.join(' '));

  return parts.join('\n\n');
}

/* ------------------------------------------------------------------ */
/*  UTM link builder                                                  */
/* ------------------------------------------------------------------ */

export function buildUtmLink(baseUrl: string, campaign?: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', SITE_CONFIG.utm.source);
  url.searchParams.set('utm_medium', SITE_CONFIG.utm.medium);
  url.searchParams.set(
    'utm_campaign',
    campaign
      ? `${SITE_CONFIG.utm.campaignPrefix}_${campaign}`
      : SITE_CONFIG.utm.campaignPrefix,
  );
  return url.toString();
}

/* ------------------------------------------------------------------ */
/*  Date helpers                                                      */
/* ------------------------------------------------------------------ */

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTodayDate(tz?: string): string {
  const timezone = tz || SITE_CONFIG.timezone;
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // YYYY-MM-DD
}

/* ------------------------------------------------------------------ */
/*  ID generation                                                     */
/* ------------------------------------------------------------------ */

export function generateId(): string {
  return crypto.randomUUID();
}
