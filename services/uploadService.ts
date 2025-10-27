/**
 * Upload Service
 * Provides pluggable image upload to obtain a public URL for rich social previews.
 *
 * Supported providers (frontend-safe if keys are exposed):
 * - imgbb: requires IMGBB_API_KEY (client-side). https://api.imgbb.com/
 * - vercelBlob: requires VERCEL_BLOB_READ_WRITE_TOKEN (exposed) and optional bucket path.
 *
 * NOTE: Exposing API keys to the client is sensitive. Prefer server-side proxy for production.
 */

export type UploadProvider = 'imgbb' | 'vercelBlob';

export interface UploadOptions {
  provider?: UploadProvider;
  fileName?: string; // hint
}

const getBase64FromDataUrl = (dataUrl: string): { base64: string; mimeType: string } => {
  const [header, data] = dataUrl.split(',');
  const mimeMatch = /data:(.*?);base64/.exec(header || '')?.[1] || 'image/jpeg';
  return { base64: data || '', mimeType: mimeMatch };
};

export async function uploadImage(imageDataUrl: string, options?: UploadOptions): Promise<{ url: string }> {
  // If a server-side upload proxy is configured, prefer it for security.
  const proxyUrl = (window as any).UPLOAD_PROXY_URL || (import.meta as any)?.env?.VITE_UPLOAD_PROXY_URL;
  if (proxyUrl) {
    return uploadViaProxy(proxyUrl, imageDataUrl, options?.fileName);
  }

  const provider = options?.provider || inferProvider();
  if (!provider) {
    throw new Error('No upload provider configured. Set IMGBB_API_KEY, VERCEL_BLOB_READ_WRITE_TOKEN, or configure a server upload proxy.');
  }

  if (provider === 'imgbb') {
    return uploadToImgBB(imageDataUrl);
  }
  if (provider === 'vercelBlob') {
    return uploadToVercelBlob(imageDataUrl, options?.fileName);
  }
  throw new Error('Unsupported upload provider');
}

async function uploadViaProxy(proxyUrl: string, imageDataUrl: string, fileName?: string): Promise<{ url: string }> {
  const res = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dataUrl: imageDataUrl, fileName }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload proxy failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (!json?.url) throw new Error('Upload proxy did not return a URL');
  return { url: json.url };
}

function inferProvider(): UploadProvider | null {
  const imgbbKey = (window as any).IMGBB_API_KEY || (import.meta as any)?.env?.VITE_IMGBB_API_KEY;
  const vercelToken = (window as any).VERCEL_BLOB_READ_WRITE_TOKEN || (import.meta as any)?.env?.VITE_VERCEL_BLOB_RW_TOKEN;
  if (imgbbKey) return 'imgbb';
  if (vercelToken) return 'vercelBlob';
  return null;
}

async function uploadToImgBB(imageDataUrl: string): Promise<{ url: string }> {
  const apiKey = (window as any).IMGBB_API_KEY || (import.meta as any)?.env?.VITE_IMGBB_API_KEY;
  if (!apiKey) throw new Error('IMGBB_API_KEY missing');
  const { base64 } = getBase64FromDataUrl(imageDataUrl);

  const form = new FormData();
  form.append('image', base64);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`imgbb upload failed: ${res.status}`);
  const json = await res.json();
  const url = json?.data?.url || json?.data?.display_url;
  if (!url) throw new Error('imgbb response did not include a URL');
  return { url };
}

async function uploadToVercelBlob(imageDataUrl: string, fileName?: string): Promise<{ url: string }> {
  const token = (window as any).VERCEL_BLOB_READ_WRITE_TOKEN || (import.meta as any)?.env?.VITE_VERCEL_BLOB_RW_TOKEN;
  if (!token) throw new Error('VERCEL_BLOB_READ_WRITE_TOKEN missing');
  const res = await fetch('https://api.vercel.com/v2/blob', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: imageDataUrl,
      encoding: 'base64',
      contentType: imageDataUrl.split(';')[0].replace('data:', '') || 'image/jpeg',
      token, // some clients require token in body
      pathname: fileName || `ai-auto-selfie-${Date.now()}.jpg`,
    }),
  });
  if (!res.ok) throw new Error(`Vercel Blob upload failed: ${res.status}`);
  const json = await res.json();
  const url = json?.url || json?.downloadUrl || json?.blob?.url;
  if (!url) throw new Error('Vercel Blob response did not include a URL');
  return { url };
}

export function isUploadConfigured(): boolean {
  const proxyUrl = (window as any).UPLOAD_PROXY_URL || (import.meta as any)?.env?.VITE_UPLOAD_PROXY_URL;
  return Boolean(
    proxyUrl ||
    (window as any).IMGBB_API_KEY || (import.meta as any)?.env?.VITE_IMGBB_API_KEY ||
    (window as any).VERCEL_BLOB_READ_WRITE_TOKEN || (import.meta as any)?.env?.VITE_VERCEL_BLOB_RW_TOKEN
  );
}
