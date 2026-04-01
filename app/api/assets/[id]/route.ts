import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAsset, deleteAsset as deleteAssetDb, addAuditLog } from '@/lib/supabase';
import { deleteAssetFile } from '@/lib/blob-stores';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(asset);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete binary from Netlify Blobs
  if (asset.blob_key) {
    await deleteAssetFile(asset.blob_key);
  }

  await deleteAssetDb(id);
  await addAuditLog('asset_deleted', 'asset', id, { name: asset.name });
  return NextResponse.json({ success: true });
}
