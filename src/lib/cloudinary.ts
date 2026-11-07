// ─── Cloudinary Client Service ────────────────────────────────────────────────
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const isCloudinaryConfigured = Boolean(
  CLOUD_NAME && 
  UPLOAD_PRESET && 
  CLOUD_NAME !== 'undefined' && 
  UPLOAD_PRESET !== 'undefined'
);

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  maxSizeBytes?: number; // Default: 5MB
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/**
 * Validates an image file before upload.
 */
export function validateImageFile(file: File, maxSizeBytes = DEFAULT_MAX_SIZE): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type}). Please select a JPEG, PNG, or WebP photo.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const limitMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is ${limitMb} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads an image file to Cloudinary using an unsigned upload preset.
 * Supports real-time upload progress tracking.
 */
export async function uploadImageToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { onProgress, maxSizeBytes = DEFAULT_MAX_SIZE } = options;

  // 1. Client-side validation
  const validation = validateImageFile(file, maxSizeBytes);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. If Cloudinary is not yet configured with keys, convert to local Data URL for seamless local testing
  if (!isCloudinaryConfigured || !CLOUD_NAME || !UPLOAD_PRESET) {
    console.warn(
      '[ReLoop Cloudinary] VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET is missing. ' +
      'Using local base64/blob preview as fallback.'
    );

    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        if (onProgress) onProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          const localUrl = URL.createObjectURL(file);
          resolve({
            url: localUrl,
            publicId: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          });
        }
      }, 50);
    });
  }

  // 3. Direct Unsigned Upload to Cloudinary REST API with XMLHttpRequest for Progress Tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url || response.url,
            publicId: response.public_id,
            width: response.width,
            height: response.height,
            format: response.format,
          });
        } catch (err) {
          reject(new Error('Invalid JSON response from Cloudinary API.'));
        }
      } else {
        try {
          const errResponse = JSON.parse(xhr.responseText);
          reject(new Error(errResponse.error?.message || `Upload failed with HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status HTTP ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during image upload to Cloudinary.'));
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'reloop_listings');

    xhr.send(formData);
  });
}
