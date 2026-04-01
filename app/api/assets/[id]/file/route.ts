import { NextRequest, NextResponse } from 'next/server';
import { getAssetFile } from '@/lib/blob-stores';

export const dynamic = 'force-dynamic';

// Public endpoint — no auth required (social APIs need to fetch this)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const file = await getAssetFile(id);

  if (!file) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(file.data, {
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Cache-Control': 'private, max-age=3600',
      'X-Robots-Tag': 'noindex',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
