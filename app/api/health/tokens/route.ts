import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getLinkedInTokens } from '@/lib/linkedin-tokens-supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const health: Record<string, unknown> = {};

  // Check Meta token
  const metaToken = process.env.META_PAGE_TOKEN;
  if (metaToken) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v25.0/me?access_token=${metaToken}`,
      );
      const data = await res.json();
      health.meta = {
        connected: !data.error,
        error: data.error?.message,
        pageId: process.env.META_PAGE_ID,
        instagramId: process.env.META_IG_ACCOUNT_ID,
      };
    } catch {
      health.meta = { connected: false, error: 'Failed to check token' };
    }
  } else {
    health.meta = { connected: false, error: 'META_PAGE_TOKEN not set' };
  }

  // Check LinkedIn token
  const liTokens = await getLinkedInTokens();
  if (liTokens) {
    const expiresIn = liTokens.expiresAt - Date.now();
    const refreshExpiresIn = liTokens.refreshExpiresAt
      ? liTokens.refreshExpiresAt - Date.now()
      : null;

    health.linkedin = {
      connected: expiresIn > 0 || (refreshExpiresIn !== null && refreshExpiresIn > 0),
      tokenExpiresIn: Math.max(0, Math.floor(expiresIn / 1000 / 60 / 60 / 24)), // days
      refreshExpiresIn: refreshExpiresIn !== null
        ? Math.max(0, Math.floor(refreshExpiresIn / 1000 / 60 / 60 / 24))
        : null,
      orgId: process.env.LINKEDIN_ORG_ID,
    };
  } else {
    health.linkedin = { connected: false, error: 'Not connected' };
  }

  return NextResponse.json(health);
}
