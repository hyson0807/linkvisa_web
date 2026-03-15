import { ApiError } from './api';

const BASE = typeof window !== 'undefined' ? window.location.origin : '';

export interface ShareLinkDocument {
  id: string;
  typeId: string;
  status: string;
  customLabel: string | null;
  files: { id: string; fileName: string; fileSize: number; mimeType: string }[];
}

export interface ShareLinkPageInfo {
  providerId: string;
  foreignerName: string;
  visaType: string;
  documents: ShareLinkDocument[];
}

export async function getShareLinkInfo(token: string): Promise<ShareLinkPageInfo> {
  const res = await fetch(`${BASE}/api/share-links/${token}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }
  return res.json();
}

export async function uploadViaShareLink(
  token: string,
  docId: string,
  file: File,
): Promise<{ id: string; fileName: string; fileSize: number }> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const res = await fetch(`${BASE}/api/share-links/${token}/upload/${docId}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? '업로드에 실패했습니다');
  }
  return res.json();
}
