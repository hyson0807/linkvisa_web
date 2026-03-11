import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ApplicationType, Case, CaseDocument, CaseStatus, DocumentTypeDef, FileHandle } from '@/types/case';
import { getDocumentsForVisa } from '@/lib/document-registry';
import { getDefaultValues } from '@/lib/manual-field-registry';
import { idbStorage } from '@/lib/idb-storage';

interface CaseStore {
  cases: Case[];
  isNewCaseModalOpen: boolean;

  openNewCaseModal: () => void;
  closeNewCaseModal: () => void;

  createCase: (foreignerName: string, companyName: string, visaType: string, applicationType?: ApplicationType) => string;
  getCase: (id: string) => Case | undefined;
  updateCaseStatus: (id: string, status: CaseStatus) => void;

  setManualField: (caseId: string, fieldId: string, value: string) => void;
  setManualFields: (caseId: string, fields: Record<string, string>) => void;

  addCustomDocument: (caseId: string, label: string, category: 'foreigner' | 'company') => void;
  uploadFile: (caseId: string, documentId: string, file: FileHandle) => void;
  setOcrResult: (caseId: string, documentId: string, ocrResult: Record<string, string>) => void;
  setAiContent: (caseId: string, documentId: string, content: string) => void;
  updateDocumentStatus: (caseId: string, documentId: string, status: CaseDocument['status']) => void;
  deleteCase: (id: string) => void;
}

export const useCaseStore = create<CaseStore>()(
  persist(
    (set, get) => ({
      cases: [],
      isNewCaseModalOpen: false,

      openNewCaseModal: () => set({ isNewCaseModalOpen: true }),
      closeNewCaseModal: () => set({ isNewCaseModalOpen: false }),

      createCase: (foreignerName, companyName, visaType, applicationType?) => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const docs = getDocumentsForVisa(visaType);
        const documents: CaseDocument[] = docs.map((d) => ({
          id: `${id}-${d.id}`,
          typeId: d.id,
          status: 'pending',
        }));

        const newCase: Case = {
          id,
          foreignerName,
          companyName,
          visaType,
          applicationType,
          status: 'documents-pending',
          documents,
          manualFields: getDefaultValues(visaType),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          cases: [...state.cases, newCase],
          isNewCaseModalOpen: false,
        }));

        return id;
      },

      getCase: (id) => get().cases.find((c) => c.id === id),

      setManualField: (caseId, fieldId, value) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, manualFields: { ...c.manualFields, [fieldId]: value } }
              : c
          ),
        })),

      setManualFields: (caseId, fields) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? { ...c, manualFields: { ...c.manualFields, ...fields } }
              : c
          ),
        })),

      updateCaseStatus: (id, status) =>
        set((state) => ({
          cases: state.cases.map((c) => (c.id === id ? { ...c, status } : c)),
        })),

      addCustomDocument: (caseId, label, category) =>
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.id !== caseId) return c;
            const customId = `custom-${Date.now().toString(36)}`;
            const newDoc: CaseDocument = {
              id: `${caseId}-${customId}`,
              typeId: customId,
              status: 'pending',
            };
            const customDocType: DocumentTypeDef = {
              id: customId,
              label,
              category,
              source: 'upload',
              step: 'upload',
              requiredForVisas: [c.visaType],
            };
            return {
              ...c,
              documents: [...c.documents, newDoc],
              customDocTypes: [...(c.customDocTypes ?? []), customDocType],
            };
          }),
        })),

      uploadFile: (caseId, documentId, file) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  documents: c.documents.map((d) =>
                    d.id === documentId ? { ...d, file, status: 'uploaded' as const } : d
                  ),
                }
              : c
          ),
        })),

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

      deleteCase: (id) =>
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'linkvisa-cases',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
