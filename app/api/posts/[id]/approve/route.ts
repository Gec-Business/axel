import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getPost, updatePost, addAuditLog } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPost(id);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.status !== 'draft') {
    return NextResponse.json({ error: `Cannot approve a post with status "${post.status}"` }, { status: 400 });
  }

  const updated = await updatePost(id, {
    status: 'approved',
    approved_at: new Date().toISOString(),
  });

  await addAuditLog('post_approved', 'post', id);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPost(id);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (post.status === 'publishing') {
    return NextResponse.json({ error: 'Cannot unapprove a post that is currently being published' }, { status: 409 });
  }

  const updated = await updatePost(id, {
    status: 'draft',
    approved_at: null,
  });

  await addAuditLog('post_unapproved', 'post', id);
  return NextResponse.json(updated);
}
