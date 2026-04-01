import { getStore } from '@netlify/blobs';

/* ------------------------------------------------------------------ */
/*  Netlify Blobs store for binary assets                             */
/* ------------------------------------------------------------------ */

function getAssetStore() {
  return getStore({ name: 'axel-assets', consistency: 'strong' });
}

/**
 * Save a binary asset to Netlify Blobs.
 */
export async function saveAssetFile(
  id: string,
  buffer: Buffer,
  mimeType: string,
): Promise<void> {
  const store = getAssetStore();
  await store.set(id, buffer, {
    metadata: { mimeType },
  });
}

/**
 * Retrieve a binary asset from Netlify Blobs.
 * Returns null if the asset does not exist.
 */
export async function getAssetFile(
  id: string,
): Promise<{ data: Buffer; mimeType: string } | null> {
  const store = getAssetStore();
  const entry = await store.getWithMetadata(id, { type: 'arrayBuffer' });
  if (!entry) return null;
  return {
    data: Buffer.from(entry.data),
    mimeType: (entry.metadata?.mimeType as string) ?? 'application/octet-stream',
  };
}

/**
 * Delete a binary asset from Netlify Blobs.
 */
export async function deleteAssetFile(id: string): Promise<void> {
  const store = getAssetStore();
  await store.delete(id);
}
