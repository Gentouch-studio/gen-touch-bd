/**
 * Cloudinary Media Architecture for GEN-TOUCH.
 * Firebase Storage is strictly prohibited.
 * All product photos, videos, and category banners go through Cloudinary.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'gen_touch_unsigned';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

/**
 * Upload an image or media file to Cloudinary safely without leaking API Secret.
 * @param file The File object from input[type="file"] or drag-drop
 * @param folder Target folder inside Cloudinary (e.g. 'products', 'categories')
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'gen-touch/products'
): Promise<string> {
  // 1. Validate file format and size (max 10MB)
  const maxSizeBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error('File size exceeds maximum allowed limit (10MB).');
  }

  // 2. Prepare FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Failed to upload to Cloudinary (HTTP ${response.status})`
      );
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    // If running in development without valid Cloudinary setup, provide a local object URL for previewing
    if (CLOUD_NAME === 'demo') {
      return URL.createObjectURL(file);
    }
    throw error;
  }
}

/**
 * Generates an auto-optimized, responsive WebP image URL from Cloudinary.
 */
export function getOptimizedImageUrl(
  url: string,
  options?: { width?: number; height?: number; quality?: string }
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width = 600, height, quality = 'auto' } = options || {};
  const transformation = [
    `w_${width}`,
    height ? `h_${height}` : '',
    'c_limit',
    'f_auto',
    `q_${quality}`,
  ]
    .filter(Boolean)
    .join(',');

  return url.replace('/upload/', `/upload/${transformation}/`);
}