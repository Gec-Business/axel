import {
  ALLOWED_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from '@/lib/constants';

// Magic byte signatures for file type validation
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'video/mp4': [], // MP4 checked by ftyp box below
  'video/quicktime': [], // Also uses ftyp
  'video/webm': [[0x1A, 0x45, 0xDF, 0xA3]],
};

/**
 * Check magic bytes of a file buffer to verify actual file type.
 * Returns the detected MIME type or null if unrecognized.
 */
export function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // JPEG: starts with FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }

  // PNG: starts with 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }

  // GIF: starts with GIF8
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return 'image/gif';
  }

  // WebM: starts with 1A 45 DF A3
  if (buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3) {
    return 'video/webm';
  }

  // MP4/MOV: check for ftyp box (bytes 4-7 = "ftyp")
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    // Check brand at bytes 8-11
    const brand = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11]);
    if (brand === 'qt  ' || brand === 'mqt ') return 'video/quicktime';
    return 'video/mp4'; // isom, mp42, avc1, etc.
  }

  return null;
}

/**
 * Validate an asset file by checking magic bytes, MIME type, and size.
 * Uses actual file content (magic bytes) instead of trusting the MIME header.
 */
export function validateAssetFile(
  mimeType: string,
  sizeBytes: number,
  buffer?: Buffer,
): { valid: boolean; error?: string; detectedType?: string } {
  // Check declared MIME type is in allowlist
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported file type "${mimeType}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // If buffer provided, verify magic bytes match declared type
  if (buffer) {
    const detected = detectMimeType(buffer);
    if (!detected) {
      return {
        valid: false,
        error: 'Could not verify file type from file contents. The file may be corrupted.',
      };
    }

    // Check that detected type is in allowlist
    if (!ALLOWED_MIME_TYPES.includes(detected)) {
      return {
        valid: false,
        error: `File contents indicate type "${detected}" which is not allowed.`,
        detectedType: detected,
      };
    }

    // Warn if declared type doesn't match detected (but still allow if both are valid)
    // e.g., declared video/quicktime but detected video/mp4 is fine
    const declaredCategory = mimeType.split('/')[0];
    const detectedCategory = detected.split('/')[0];
    if (declaredCategory !== detectedCategory) {
      return {
        valid: false,
        error: `File header says "${mimeType}" but contents are "${detected}". Possible spoofed file.`,
        detectedType: detected,
      };
    }
  }

  // Check size limits
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
