import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addAuditLog, getSettings, setSetting } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

interface RateLimitState {
  attempts: number;
  lockedUntil: string | null;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // Check rate limit
  const rlKey = `login_ratelimit_${ip}`;
  const rlState = (await getSettings(rlKey)) as RateLimitState | null;

  if (rlState?.lockedUntil && new Date(rlState.lockedUntil) > new Date()) {
    const minutesLeft = Math.ceil((new Date(rlState.lockedUntil).getTime() - Date.now()) / 60000);
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${minutesLeft} minutes.` },
      { status: 429 },
    );
  }

  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD not configured' }, { status: 500 });
  }

  if (password !== adminPassword) {
    const attempts = (rlState?.attempts || 0) + 1;
    const newState: RateLimitState = {
      attempts,
      lockedUntil: attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString()
        : null,
    };
    await setSetting(rlKey, newState);
    await addAuditLog('login_failed', 'auth', undefined, { ip, attempts });

    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: `Too many failed attempts. Locked for ${LOCKOUT_MINUTES} minutes.` },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Success — clear rate limit
  await setSetting(rlKey, { attempts: 0, lockedUntil: null });

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  await addAuditLog('login', 'auth', undefined, { ip });
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
}
