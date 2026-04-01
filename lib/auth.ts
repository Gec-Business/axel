import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionData } from '@/lib/types';

/* ------------------------------------------------------------------ */
/*  Session password                                                  */
/* ------------------------------------------------------------------ */

function getSessionPassword(): string {
  const pw = process.env.SESSION_SECRET;
  if (pw && pw.length >= 32) return pw;
  // Fallback for local development only — never use in production
  return 'axel-local-dev-secret-min-32-chars!!';
}

/* ------------------------------------------------------------------ */
/*  Session options                                                   */
/* ------------------------------------------------------------------ */

export const sessionOptions: SessionOptions = {
  password: getSessionPassword(),
  cookieName: 'axel-dashboard-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true;
}
