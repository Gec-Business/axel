/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type Platform = 'facebook' | 'instagram' | 'linkedin';

export type ContentType =
  | 'carousel'
  | 'reel'
  | 'story'
  | 'image_post'
  | 'text_post'
  | 'video';

export type PostStatus =
  | 'draft'
  | 'approved'
  | 'publishing'
  | 'posted'
  | 'failed';

export type ContentPillar =
  | 'academy'
  | 'members'
  | 'events'
  | 'portfolio'
  | 'general';

/* ------------------------------------------------------------------ */
/*  Core interfaces                                                   */
/* ------------------------------------------------------------------ */

export interface Post {
  id: string;
  created_at: string;
  updated_at: string;

  /** Campaign this post belongs to */
  campaign_id?: string;

  /** Content pillar */
  pillar: ContentPillar;

  /** Platforms this post targets */
  platforms: Platform[];

  /** Content type */
  content_type: ContentType;

  /** Scheduling */
  scheduled_date: string;
  scheduled_time?: string;

  /** Status */
  status: PostStatus;

  /** Default copy (Georgian / English) */
  copy_ka: string;
  copy_en: string;

  /** Per-platform copy overrides */
  copy_ka_facebook?: string;
  copy_en_facebook?: string;
  copy_ka_instagram?: string;
  copy_en_instagram?: string;
  copy_ka_linkedin?: string;
  copy_en_linkedin?: string;

  /** Default hashtags */
  hashtags?: string[];

  /** Per-platform hashtag overrides */
  hashtags_facebook?: string[];
  hashtags_instagram?: string[];
  hashtags_linkedin?: string[];

  /** Attached asset IDs */
  asset_ids?: string[];

  /** Publishing results per platform */
  publish_results?: Record<Platform, PublishResult>;

  /** Free-form notes */
  notes?: string;
}

export interface Campaign {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  name_ka?: string;
  description?: string;
  pillar: ContentPillar;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'draft';
}

export interface Asset {
  id: string;
  created_at: string;
  name: string;
  category: string;
  tags: string[];
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  storage_type: 'blob' | 'cloudinary';
  blob_key?: string;
  cloudinary_url?: string;
  thumbnail_url?: string;
  public_url?: string;
}

export interface AuditEntry {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
}

export interface PublishResult {
  posted: boolean;
  posted_at: string;
  post_id?: string;
  error?: string;
  auto_posted: boolean;
}

/* ------------------------------------------------------------------ */
/*  Content pillars                                                   */
/* ------------------------------------------------------------------ */

export const CONTENT_PILLARS: Record<
  ContentPillar,
  { name: string; nameKa: string; color: string }
> = {
  academy: { name: 'Academy', nameKa: 'აკადემია', color: '#6366F1' },
  members: { name: 'Members', nameKa: 'წევრები', color: '#EC4899' },
  events: { name: 'Events', nameKa: 'ღონისძიებები', color: '#F59E0B' },
  portfolio: { name: 'Portfolio', nameKa: 'პორტფოლიო', color: '#10B981' },
  general: { name: 'General', nameKa: 'ზოგადი', color: '#6B7280' },
};

/* ------------------------------------------------------------------ */
/*  Platform info                                                     */
/* ------------------------------------------------------------------ */

export const PLATFORM_INFO: Record<
  Platform,
  { name: string; color: string; iconLabel: string }
> = {
  facebook: { name: 'Facebook', color: '#1877F2', iconLabel: 'FB' },
  instagram: { name: 'Instagram', color: '#E4405F', iconLabel: 'IG' },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', iconLabel: 'LI' },
};

/* ------------------------------------------------------------------ */
/*  File constraints                                                  */
/* ------------------------------------------------------------------ */

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

/** 10 MB */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/** 100 MB */
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
