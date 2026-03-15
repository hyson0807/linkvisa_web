import { create } from 'zustand';
import type { ApplicationType, Case, CaseDocument, CaseStatus, FileHandle } from '@/types/case';
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

  addCustomDocument: (caseId: string, label: string, category: 'foreigner' | 'company') => Promise<void>;
  uploadFile: (caseId: string, documentId: string, file: File) => Promise<void>;
  setOcrResult: (caseId: string, documentId: string, ocrResult: Record<string, string>) => void;
  setAiContent: (caseId: string, documentId: string, content: string) => void;
  updateDocumentStatus: (caseId: string, documentId: string, status: CaseDocument['status']) => void;
  deleteCase: (id: string) => Promise<void>;
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
      name: result.fileName,
      size: result.fileSize,
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
}));
