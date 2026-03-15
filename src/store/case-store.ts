import { create } from 'zustand';
import type { ApplicationType, Case, CaseDocument, CaseStatus, FileHandle, ShareLinkInfo } from '@/types/case';
import { caseApi } from '@/lib/case-api';
import { getSessionToken } from '@/lib/session-token';

interface CaseStore {
  cases: Case[];
  loading: boolean;

  createCase: (foreignerName: string, companyName: string, visaType: string, applicationType?: ApplicationType) => Promise<string>;
  fetchCases: () => Promise<void>;
  fetchCase: (id: string) => Promise<Case | null>;
  getCase: (id: string) => Case | undefined;

  updateCase: (id: string, data: Record<string, unknown>) => Promise<void>;
  updateCaseStatus: (id: string, status: CaseStatus) => void;

  setManualField: (caseId: string, fieldId: string, value: string) => void;
  setManualFields: (caseId: string, fields: Record<string, string>) => void;

  removeFile: (caseId: string, documentId: string, fileId: string) => Promise<void>;
  deleteDocument: (caseId: string, documentId: string) => Promise<void>;
  updateDocumentLabel: (caseId: string, documentId: string, label: string) => Promise<void>;
  addCustomDocument: (caseId: string, label: string, category: 'foreigner' | 'company') => Promise<void>;
  uploadFile: (caseId: string, documentId: string, file: File) => Promise<void>;
  setOcrResult: (caseId: string, documentId: string, ocrResult: Record<string, string>) => void;
  setAiContent: (caseId: string, documentId: string, content: string) => void;
  updateDocumentStatus: (caseId: string, documentId: string, status: CaseDocument['status']) => void;
  deleteCase: (id: string) => Promise<void>;
  createShareLink: (caseId: string, providerId: string) => Promise<ShareLinkInfo>;
}

function mapShareLinks(
  raw: unknown,
): Record<string, ShareLinkInfo> | undefined {
  if (!Array.isArray(raw)) return undefined;
  const now = new Date();
  const result: Record<string, ShareLinkInfo> = {};
  for (const item of raw) {
    const r = item as Record<string, unknown>;
    const type = r.type as string;
    const isActive = r.isActive as boolean;
    const expiresAt = r.expiresAt as string;
    if (isActive && new Date(expiresAt) > now) {
      result[type] = {
        token: r.token as string,
        expiresAt,
        isActive,
      };
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function mapServerCase(raw: Record<string, unknown>): Case {
  const documents = (raw.documents as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    id: raw.id as string,
    foreignerName: (raw.foreignerName as string) ?? '',
    companyName: (raw.companyName as string) ?? '',
    visaType: raw.visaType as string,
    applicationType: raw.applicationType as ApplicationType | undefined,
    status: (raw.status as CaseStatus) ?? 'draft',
    documents: documents.map((d) => ({
      id: d.id as string,
      typeId: d.typeId as string,
      status: (d.status as CaseDocument['status']) ?? 'pending',
      files: ((d.files as Array<Record<string, unknown>> | undefined) ?? []).map((f) => ({
        id: f.id as string,
        name: f.fileName as string,
        size: f.fileSize as number,
        type: f.mimeType as string,
      })),
      ocrResult: d.ocrResult as Record<string, string> | undefined,
      aiContent: d.aiContent as string | undefined,
      isCustom: d.isCustom as boolean | undefined,
      customLabel: d.customLabel as string | undefined,
      customCategory: d.customCategory as string | undefined,
    })),
    manualFields: (raw.manualFields as Record<string, string>) ?? {},
    shareLinks: mapShareLinks(raw.shareLinks),
    createdAt: raw.createdAt as string,
  };
}

export const useCaseStore = create<CaseStore>()((set, get) => ({
  cases: [],
  loading: false,

  createCase: async (foreignerName, companyName, visaType, applicationType?) => {
    const sessionToken = getSessionToken();
    const result = await caseApi.create({
      foreignerName,
      companyName,
      visaType,
      applicationType,
      sessionToken,
    });
    const newCase = mapServerCase(result as Record<string, unknown>);
    set((state) => ({ cases: [...state.cases, newCase] }));
    return newCase.id;
  },

  fetchCases: async () => {
    set({ loading: true });
    try {
      const raw = await caseApi.list();
      const cases = (raw as Array<Record<string, unknown>>).map(mapServerCase);
      set({ cases, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCase: async (id) => {
    try {
      const raw = await caseApi.get(id);
      const caseData = mapServerCase(raw);
      set((state) => {
        const exists = state.cases.some((c) => c.id === id);
        return {
          cases: exists
            ? state.cases.map((c) => (c.id === id ? caseData : c))
            : [...state.cases, caseData],
        };
      });
      return caseData;
    } catch {
      return null;
    }
  },

  getCase: (id) => get().cases.find((c) => c.id === id),

  updateCase: async (id, data) => {
    const raw = await caseApi.update(id, data);
    const updated = mapServerCase(raw as Record<string, unknown>);
    set((state) => ({
      cases: state.cases.map((c) => (c.id === id ? updated : c)),
    }));
  },

  updateCaseStatus: (id, status) => {
    set((state) => ({
      cases: state.cases.map((c) => (c.id === id ? { ...c, status } : c)),
    }));
    caseApi.update(id, { status }).catch(() => {});
  },

  setManualField: (caseId, fieldId, value) => {
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? { ...c, manualFields: { ...c.manualFields, [fieldId]: value } }
          : c
      ),
    }));
  },

  setManualFields: (caseId, fields) => {
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? { ...c, manualFields: { ...c.manualFields, ...fields } }
          : c
      ),
    }));
    caseApi.update(caseId, { manualFields: fields }).catch(() => {});
  },

  removeFile: async (caseId, documentId, fileId) => {
    await caseApi.deleteFile(caseId, documentId, fileId);
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              documents: c.documents.map((d) => {
                if (d.id !== documentId) return d;
                const files = (d.files ?? []).filter((f) => f.id !== fileId);
                return { ...d, files, status: files.length > 0 ? d.status : 'pending' as const };
              }),
            }
          : c
      ),
    }));
  },

  deleteDocument: async (caseId, documentId) => {
    await caseApi.deleteDocument(caseId, documentId);
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? { ...c, documents: c.documents.filter((d) => d.id !== documentId) }
          : c
      ),
    }));
  },

  updateDocumentLabel: async (caseId, documentId, label) => {
    await caseApi.updateDocument(caseId, documentId, { label });
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              documents: c.documents.map((d) =>
                d.id === documentId ? { ...d, customLabel: label } : d
              ),
            }
          : c
      ),
    }));
  },

  addCustomDocument: async (caseId, label, category) => {
    const raw = await caseApi.addCustomDocument(caseId, label, category);
    const doc = raw as Record<string, unknown>;
    const newDoc: CaseDocument = {
      id: doc.id as string,
      typeId: doc.typeId as string,
      status: 'pending',
      isCustom: true,
      customLabel: label,
      customCategory: category,
    };
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? { ...c, documents: [...c.documents, newDoc] }
          : c
      ),
    }));
  },

  uploadFile: async (caseId, documentId, file) => {
    const result = await caseApi.uploadFile(caseId, documentId, file);
    const fileHandle: FileHandle = {
      id: result.id,
      name: file.name,
      size: file.size,
      type: file.type,
    };
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              documents: c.documents.map((d) =>
                d.id === documentId
                  ? { ...d, files: [...(d.files ?? []), fileHandle], status: 'uploaded' as const }
                  : d
              ),
            }
          : c
      ),
    }));
  },

  setOcrResult: (caseId, documentId, ocrResult) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              documents: c.documents.map((d) =>
                d.id === documentId ? { ...d, ocrResult, status: 'ocr-complete' as const } : d
              ),
            }
          : c
      ),
    })),

  setAiContent: (caseId, documentId, content) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              documents: c.documents.map((d) =>
                d.id === documentId ? { ...d, aiContent: content, status: 'complete' as const } : d
              ),
            }
          : c
      ),
    })),

  updateDocumentStatus: (caseId, documentId, status) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              documents: c.documents.map((d) =>
                d.id === documentId ? { ...d, status } : d
              ),
            }
          : c
      ),
    })),

  deleteCase: async (id) => {
    await caseApi.delete(id);
    set((state) => ({
      cases: state.cases.filter((c) => c.id !== id),
    }));
  },

  createShareLink: async (caseId, providerId) => {
    const result = await caseApi.createShareLink(caseId, providerId);
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              shareLinks: {
                ...(c.shareLinks ?? {}),
                [providerId]: result,
              },
            }
          : c
      ),
    }));
    return result;
  },
}));
