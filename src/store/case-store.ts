import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ApplicationType, Case, CaseDocument, CaseStatus, DocumentTypeDef, FileHandle, StudentSubmission } from '@/types/case';
import { getDocumentsForVisa } from '@/lib/document-registry';
import { getDefaultValues } from '@/lib/manual-field-registry';
import { idbStorage } from '@/lib/idb-storage';

interface CaseStore {
  cases: Case[];

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

  getCaseByToken: (token: string) => Case | undefined;
  submitStudentData: (token: string, fields: Record<string, string>, documents: { docTypeId: string; file: FileHandle }[]) => boolean;
}

export const useCaseStore = create<CaseStore>()(
  persist(
    (set, get) => ({
      cases: [],

      createCase: (foreignerName, companyName, visaType, applicationType?) => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const docs = getDocumentsForVisa(visaType);
        const documents: CaseDocument[] = docs.map((d) => ({
          id: `${id}-${d.id}`,
          typeId: d.id,
          status: 'pending',
        }));

        // D-2 비자의 경우 학생 제출 링크 토큰 자동 생성
        const studentLinkToken = visaType === 'D-2'
          ? `stud-${id}-${Math.random().toString(36).slice(2, 8)}`
          : undefined;

        const newCase: Case = {
          id,
          foreignerName,
          companyName,
          visaType,
          applicationType,
          status: 'documents-pending',
          documents,
          manualFields: getDefaultValues(visaType),
          studentLinkToken,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          cases: [...state.cases, newCase],
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

      getCaseByToken: (token) =>
        get().cases.find((c) => c.studentLinkToken === token),

      submitStudentData: (token, fields, documents) => {
        const caseData = get().cases.find((c) => c.studentLinkToken === token);
        if (!caseData) return false;

        const submission: StudentSubmission = {
          submittedAt: new Date().toISOString(),
          fields,
        };

        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.studentLinkToken !== token) return c;

            // 학생 제출 서류 업데이트
            let updatedDocs = [...c.documents];
            for (const doc of documents) {
              updatedDocs = updatedDocs.map((d) =>
                d.typeId === doc.docTypeId
                  ? { ...d, file: doc.file, status: 'uploaded' as const }
                  : d
              );
            }

            // 학생 입력 필드를 manualFields에 병합
            return {
              ...c,
              documents: updatedDocs,
              manualFields: { ...c.manualFields, ...fields },
              studentSubmission: submission,
            };
          }),
        }));

        return true;
      },
    }),
    {
      name: 'linkvisa-cases',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
