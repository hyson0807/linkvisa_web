'use client';

import type { CaseDocument, DocumentTypeDef } from '@/types/case';
import ModalOverlay from '@/app/cases/_components/ModalOverlay';
import DocumentPreviewPaper from './DocumentPreviewPaper';

interface DocumentInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType: DocumentTypeDef | null;
  caseDoc: CaseDocument | null;
}

export default function DocumentInspectModal({ isOpen, onClose, docType, caseDoc }: DocumentInspectModalProps) {
  if (!docType || !caseDoc) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={docType.label} size="xl">
      <div className="mt-2">
        <DocumentPreviewPaper docType={docType} caseDoc={caseDoc} />
      </div>
      <div className="mt-6 flex justify-end">
        <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark">
          다운로드 (PDF)
        </button>
      </div>
    </ModalOverlay>
  );
}
