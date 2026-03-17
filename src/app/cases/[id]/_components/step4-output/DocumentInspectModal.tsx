'use client';

import type { Case, CaseDocument, DocumentTypeDef } from '@/types/case';
import ModalOverlay from '@/app/cases/_components/ModalOverlay';
import DocumentPreviewPaper from './DocumentPreviewPaper';
import '@/lib/pdf/forms';
import { getForm } from '@/lib/pdf/form-registry';
import { usePdfDownload } from '@/hooks/usePdfDownload';

interface DocumentInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType: DocumentTypeDef | null;
  caseDoc: CaseDocument | null;
  caseData: Case;
}

export default function DocumentInspectModal({ isOpen, onClose, docType, caseDoc, caseData }: DocumentInspectModalProps) {
  const { downloading, downloadForm } = usePdfDownload(caseData);

  if (!docType || !caseDoc) return null;

  const formDef = getForm(docType.id);
  const canDownloadPdf = !!formDef;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={docType.label} size="xl">
      <div className="mt-2">
        <DocumentPreviewPaper docType={docType} caseDoc={caseDoc} />
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => formDef && downloadForm(formDef.id)}
          disabled={downloading || !canDownloadPdf}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark disabled:opacity-50"
        >
          {downloading ? '생성 중...' : '다운로드 (PDF)'}
        </button>
      </div>
    </ModalOverlay>
  );
}
