import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { SITE_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'LINKEDIN_CLIENT_ID not set' }, { status: 500 });
  }

  const redirectUri = `${SITE_CONFIG.url}/api/linkedin/callback`;
  const state = crypto.randomUUID();
  const scope = 'w_member_social w_organization_social r_organization_social openid profile';

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
