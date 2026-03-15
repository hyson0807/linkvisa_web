import { api } from './api';

export const caseApi = {
  create: (data: {
    foreignerName: string;
    companyName: string;
    visaType: string;
    visaSubtype?: string;
    applicationType?: string;
    sessionToken?: string;
  }) =>
    api<{ id: string }>('/api/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () => api<unknown[]>('/api/cases'),

  get: (id: string) => api<Record<string, unknown>>(`/api/cases/${id}`),

  update: (id: string, data: Record<string, unknown>) =>
    api(`/api/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    api(`/api/cases/${id}`, { method: 'DELETE' }),

  claim: (sessionToken: string) =>
    api('/api/cases/claim', {
      method: 'POST',
      body: JSON.stringify({ sessionToken }),
    }),

  uploadFile: (caseId: string, docId: string, file: File) => {
    const formData = new FormData();
    // Explicitly pass the filename to preserve non-ASCII characters (e.g. Korean)
    formData.append('file', file, file.name);
    return api<{ id: string; fileName: string; fileSize: number }>(
      `/api/cases/${caseId}/documents/${docId}/upload`,
      { method: 'POST', body: formData },
    );
  },

  getFileUrl: (caseId: string, docId: string, fileId: string) =>
    api<{ url: string }>(
      `/api/cases/${caseId}/documents/${docId}/files/${fileId}/url`,
    ),

  getFiles: (caseId: string, docId: string) =>
    api<{ id: string; fileName: string; fileSize: number }[]>(
      `/api/cases/${caseId}/documents/${docId}/files`,
    ),

  deleteFile: (caseId: string, docId: string, fileId: string) =>
    api(`/api/cases/${caseId}/documents/${docId}/files/${fileId}`, { method: 'DELETE' }),

  deleteDocument: (caseId: string, docId: string) =>
    api(`/api/cases/${caseId}/documents/${docId}`, { method: 'DELETE' }),

  updateDocument: (caseId: string, docId: string, data: { label?: string }) =>
    api(`/api/cases/${caseId}/documents/${docId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  addCustomDocument: (
    caseId: string,
    label: string,
    category: 'foreigner' | 'company',
  ) =>
    api(`/api/cases/${caseId}/documents`, {
      method: 'POST',
      body: JSON.stringify({ label, category }),
    }),
};
