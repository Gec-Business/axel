import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { updatePost, addAuditLog } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ids } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
  }

  const results: { id: string; success: boolean; error?: string }[] = [];
  const now = new Date().toISOString();

  for (const id of ids) {
    try {
      await updatePost(id, { status: 'approved', approved_at: now });
      await addAuditLog('post_approved', 'post', id, { batch: true });
      results.push({ id, success: true });
    } catch (err) {
      results.push({ id, success: false, error: String(err) });
    }
  }

  return NextResponse.json({ results, approved: results.filter(r => r.success).length });
}
