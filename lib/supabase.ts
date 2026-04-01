import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Post,
  Campaign,
  ContentPillar,
  PostStatus,
  Platform,
} from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Client                                                            */
/* ------------------------------------------------------------------ */

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables',
    );
  }
  _client = createClient(url, key);
  return _client;
}

/* ------------------------------------------------------------------ */
/*  Posts                                                              */
/* ------------------------------------------------------------------ */

export interface PostFilters {
  status?: PostStatus;
  pillar?: ContentPillar;
  campaign_id?: string;
  date_from?: string;
  date_to?: string;
  platform?: Platform;
}

export async function getAllPosts(filters?: PostFilters): Promise<Post[]> {
  const db = getClient();
  let query = db
    .from('posts')
    .select('*')
    .order('scheduled_date', { ascending: true });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.pillar) {
    query = query.eq('pillar', filters.pillar);
  }
  if (filters?.campaign_id) {
    query = query.eq('campaign_id', filters.campaign_id);
  }
  if (filters?.date_from) {
    query = query.gte('scheduled_date', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('scheduled_date', filters.date_to);
  }
  if (filters?.platform) {
    query = query.contains('platforms', [filters.platform]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getPost(id: string): Promise<Post | null> {
  const db = getClient();
  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as Post;
}

export async function createPost(
  data: Omit<Post, 'id' | 'created_at' | 'updated_at'>,
): Promise<Post> {
  const db = getClient();
  const { data: created, error } = await db
    .from('posts')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created as Post;
}

export async function updatePost(
  id: string,
  data: Partial<Post>,
): Promise<Post> {
  const db = getClient();
  const { data: updated, error } = await db
    .from('posts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as Post;
}

export async function deletePost(id: string): Promise<void> {
  const db = getClient();
  const { error } = await db.from('posts').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/*  Campaigns                                                         */
/* ------------------------------------------------------------------ */

export interface CampaignFilters {
  status?: Campaign['status'];
  pillar?: ContentPillar;
}

export async function getAllCampaigns(
  filters?: CampaignFilters,
): Promise<Campaign[]> {
  const db = getClient();
  let query = db
    .from('campaigns')
    .select('*')
    .order('start_date', { ascending: true });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.pillar) {
    query = query.eq('pillar', filters.pillar);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Campaign[];
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const db = getClient();
  const { data, error } = await db
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Campaign;
}

export async function createCampaign(
  data: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>,
): Promise<Campaign> {
  const db = getClient();
  const { data: created, error } = await db
    .from('campaigns')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created as Campaign;
}

export async function updateCampaign(
  id: string,
  data: Partial<Campaign>,
): Promise<Campaign> {
  const db = getClient();
  const { data: updated, error } = await db
    .from('campaigns')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as Campaign;
}

export async function deleteCampaign(id: string): Promise<void> {
  const db = getClient();
  const { error } = await db.from('campaigns').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ */
/*  Audit log                                                         */
/* ------------------------------------------------------------------ */

export async function addAuditLog(
  action: string,
  entity_type: string,
  entity_id?: string,
  details?: string,
): Promise<void> {
  const db = getClient();
  const { error } = await db
    .from('audit_log')
    .insert({ action, entity_type, entity_id, details });
  if (error) {
    console.error('Failed to write audit log:', error);
  }
}

/* ------------------------------------------------------------------ */
/*  Settings (key-value)                                              */
/* ------------------------------------------------------------------ */

export async function getSettings(
  key: string,
): Promise<string | null> {
  const db = getClient();
  const { data, error } = await db
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return (data?.value as string) ?? null;
}

export async function setSetting(
  key: string,
  value: string,
): Promise<void> {
  const db = getClient();
  const { error } = await db
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
