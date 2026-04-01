import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllAssets, createAsset, addAuditLog } from '@/lib/supabase';
import { saveAssetFile } from '@/lib/blob-stores';
import { validateAssetFile } from '@/lib/image-processor';
import { SITE_CONFIG } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters = {
    category: searchParams.get('category') || undefined,
    tag: searchParams.get('tag') || undefined,
    mime_type: searchParams.get('mimeType') || undefined,
  };

  const assets = await getAllAssets(filters);
  return NextResponse.json(assets);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const mimeType = file.type;
  const sizeBytes = file.size;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Validate file — checks MIME type, size limits, AND magic bytes
  const validation = validateAssetFile(mimeType, sizeBytes, buffer);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const id = crypto.randomUUID();

  // Store in Netlify Blobs
  await saveAssetFile(id, buffer, mimeType);

  const publicUrl = `${SITE_CONFIG.url}/api/assets/${id}/file`;

  const category = (formData.get('category') as string) || 'general';
  const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];
  const name = (formData.get('name') as string) || file.name;

  const asset = await createAsset({
    id,
    name,
    category,
    tags,
    mime_type: mimeType,
    size_bytes: sizeBytes,
    storage_type: 'blob',
    blob_key: id,
    public_url: publicUrl,
  });

  if (asset) {
    await addAuditLog('asset_uploaded', 'asset', id, { name, mimeType, sizeBytes });
  }

  return NextResponse.json(asset, { status: 201 });
}
