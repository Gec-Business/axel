import {
  ALLOWED_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from '@/lib/constants';

/**
 * Validate an asset file by MIME type and size.
 */
export function validateAssetFile(
  mimeType: string,
  sizeBytes: number,
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported file type "${mimeType}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  if (isImageMimeType(mimeType) && sizeBytes > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image exceeds maximum size of ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
    };
  }

  if (isVideoMimeType(mimeType) && sizeBytes > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video exceeds maximum size of ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Check whether a MIME type corresponds to an image.
 */
export function isImageMimeType(mime: string): boolean {
  return mime.startsWith('image/');
}

/**
 * Check whether a MIME type corresponds to a video.
 */
export function isVideoMimeType(mime: string): boolean {
  return mime.startsWith('video/');
}
