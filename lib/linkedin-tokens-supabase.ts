import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LinkedInTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  refreshExpiresAt: number | null;
}

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables',
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// ---------------------------------------------------------------------------
// Token persistence
// ---------------------------------------------------------------------------

export async function saveLinkedInTokens(
  tokens: LinkedInTokens,
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from('linkedin_tokens').upsert(
    {
      id: 'current',
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_at: tokens.expiresAt,
      refresh_expires_at: tokens.refreshExpiresAt,
    },
    { onConflict: 'id' },
  );

  if (error) {
    throw new Error(`Failed to save LinkedIn tokens: ${error.message}`);
  }
}

export async function getLinkedInTokens(): Promise<LinkedInTokens | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('linkedin_tokens')
    .select('access_token, refresh_token, expires_at, refresh_expires_at')
    .eq('id', 'current')
    .single();

  if (error || !data) {
    return null;
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    refreshExpiresAt: data.refresh_expires_at,
  };
}

// ---------------------------------------------------------------------------
// Token refresh & validation
// ---------------------------------------------------------------------------

export async function getValidLinkedInToken(): Promise<string | null> {
  try {
    const tokens = await getLinkedInTokens();
    if (!tokens) {
      console.error('No LinkedIn tokens found in Supabase');
      return null;
    }

    const now = Date.now();
    const bufferMs = 5 * 60 * 1000; // 5 minutes

    // Token is still valid (with 5-minute buffer)
    if (tokens.expiresAt - bufferMs > now) {
      return tokens.accessToken;
    }

    // Token expired -- attempt refresh
    if (!tokens.refreshToken) {
      console.error('LinkedIn access token expired and no refresh token available');
      return null;
    }

    // Check if the refresh token itself has expired
    if (
      tokens.refreshExpiresAt !== null &&
      tokens.refreshExpiresAt < now
    ) {
      console.error('LinkedIn refresh token has expired; re-authorization required');
      return null;
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error(
        'Missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET for token refresh',
      );
      return null;
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`LinkedIn token refresh failed (${res.status}): ${errText}`);
      return null;
    }

    const data = (await res.json()) as Record<string, unknown>;

    const newAccessToken = String(data.access_token);
    const expiresIn = Number(data.expires_in); // seconds
    const newRefreshToken =
      data.refresh_token != null ? String(data.refresh_token) : tokens.refreshToken;
    const refreshExpiresIn =
      data.refresh_token_expires_in != null
        ? Number(data.refresh_token_expires_in)
        : null;

    const newTokens: LinkedInTokens = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: now + expiresIn * 1000,
      refreshExpiresAt:
        refreshExpiresIn !== null ? now + refreshExpiresIn * 1000 : tokens.refreshExpiresAt,
    };

    await saveLinkedInTokens(newTokens);

    return newAccessToken;
  } catch (err) {
    console.error('getValidLinkedInToken error:', err);
    return null;
  }
}
