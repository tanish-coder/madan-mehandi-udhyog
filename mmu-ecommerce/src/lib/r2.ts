import { supabase } from './supabase';

export interface R2Config {
  accountId: string;
  bucketName: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrl: string;
}

export interface UploadResult {
  url: string;
  objectKey: string;
  size: number;
  type: string;
  provider: 'cloudflare-r2' | 'supabase-storage';
  fileName: string;
}

// Get R2 config from env or fallback settings
export function getR2Config(): R2Config {
  const envAccount = import.meta.env.VITE_R2_ACCOUNT_ID || '';
  const envBucket = import.meta.env.VITE_R2_BUCKET_NAME || 'mmu-media';
  const envKey = import.meta.env.VITE_R2_ACCESS_KEY_ID || '';
  const envSecret = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '';
  const envPublic = import.meta.env.VITE_R2_PUBLIC_URL || '';

  // Check localStorage for admin overrides
  const localConfigStr = localStorage.getItem('mmu_r2_config');
  if (localConfigStr) {
    try {
      const parsed = JSON.parse(localConfigStr);
      return {
        accountId: parsed.accountId || envAccount,
        bucketName: parsed.bucketName || envBucket,
        accessKeyId: parsed.accessKeyId || envKey,
        secretAccessKey: parsed.secretAccessKey || envSecret,
        publicUrl: parsed.publicUrl || envPublic,
      };
    } catch {
      // Ignore parse errors
    }
  }

  return {
    accountId: envAccount,
    bucketName: envBucket,
    accessKeyId: envKey,
    secretAccessKey: envSecret,
    publicUrl: envPublic,
  };
}

// Save R2 config to localStorage (from admin settings)
export function saveR2Config(config: R2Config): void {
  localStorage.setItem('mmu_r2_config', JSON.stringify(config));
}

/**
 * Uploads an image or video file.
 * Uses Cloudflare R2 if configured; otherwise uses Supabase Storage 'mmu-media' bucket.
 */
export async function uploadMedia(
  file: File,
  folder: 'products' | 'videos' | 'packaging' = 'products',
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const r2 = getR2Config();
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const objectKey = `${folder}/${timestamp}-${cleanName}`;

  // Notify start
  if (onProgress) onProgress(20);

  // 1. If Cloudflare R2 public URL and credentials are set:
  if (r2.publicUrl && r2.accountId && r2.accessKeyId && r2.secretAccessKey) {
    try {
      // Direct S3/R2 REST API PUT
      const endpoint = `https://${r2.accountId}.r2.cloudflarestorage.com/${r2.bucketName}/${objectKey}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (response.ok) {
        if (onProgress) onProgress(100);
        const publicBase = r2.publicUrl.endsWith('/')
          ? r2.publicUrl.slice(0, -1)
          : r2.publicUrl;
        return {
          url: `${publicBase}/${objectKey}`,
          objectKey,
          size: file.size,
          type: file.type,
          provider: 'cloudflare-r2',
          fileName: file.name,
        };
      }
    } catch (err) {
      console.warn('Direct R2 upload encountered an issue, falling back to Supabase Storage bucket:', err);
    }
  }

  // 2. High-performance fallback: Supabase Storage 'mmu-media' bucket
  if (onProgress) onProgress(50);

  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('mmu-media')
    .upload(objectKey, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (uploadErr) {
    throw new Error(`Media upload failed: ${uploadErr.message}`);
  }

  if (onProgress) onProgress(90);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('mmu-media')
    .getPublicUrl(uploadData.path);

  if (onProgress) onProgress(100);

  return {
    url: urlData.publicUrl,
    objectKey: uploadData.path,
    size: file.size,
    type: file.type,
    provider: r2.publicUrl ? 'cloudflare-r2' : 'supabase-storage',
    fileName: file.name,
  };
}
