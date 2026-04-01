import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getSettings, setSetting } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const utm = await getSettings('utm');
  const general = await getSettings('general');

  return NextResponse.json({
    utm: utm || { source: 'social', medium: 'organic', campaignPrefix: 'axel' },
    general: general || {},
  });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (body.utm) await setSetting('utm', body.utm);
  if (body.general) await setSetting('general', body.general);

  return NextResponse.json({ success: true });
}
