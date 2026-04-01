import { NextRequest, NextResponse } from 'next/server';
import { saveLinkedInTokens } from '@/lib/linkedin-tokens-supabase';
import { SITE_CONFIG } from '@/lib/config';
import { addAuditLog } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${SITE_CONFIG.url}/dashboard/settings?error=linkedin_denied`);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${SITE_CONFIG.url}/dashboard/settings?error=linkedin_config`);
  }

  const redirectUri = `${SITE_CONFIG.url}/api/linkedin/callback`;

  try {
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await tokenRes.json();
    if (!data.access_token) {
      return NextResponse.redirect(`${SITE_CONFIG.url}/dashboard/settings?error=linkedin_token`);
    }

    await saveLinkedInTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      expiresAt: Date.now() + (data.expires_in * 1000),
      refreshExpiresAt: data.refresh_token_expires_in
        ? Date.now() + (data.refresh_token_expires_in * 1000)
        : null,
    });

    await addAuditLog('linkedin_connected', 'auth');
    return NextResponse.redirect(`${SITE_CONFIG.url}/dashboard/settings?linkedin=connected`);
  } catch {
    return NextResponse.redirect(`${SITE_CONFIG.url}/dashboard/settings?error=linkedin_error`);
  }
}
