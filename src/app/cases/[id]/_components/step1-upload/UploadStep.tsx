'use client';

import { useCallback, useMemo, useState } from 'react';
import { useCaseStore } from '@/store/case-store';
import { resolveDocsWithType } from '@/lib/document-registry';
import ModalOverlay from '@/app/cases/_components/ModalOverlay';
import { readFileAsDataUrl, formatFileSize } from '@/lib/file-utils';
import type { Case, DocWithType, DocumentTypeDef, CaseDocument } from '@/types/case';

interface UploadStepProps {
  caseData: Case;
  onNext: () => void;
}

function DocumentSlot({
  docType,
  caseDoc,
  caseId,
}: {
  docType: DocumentTypeDef;
  caseDoc: CaseDocument;
  caseId: string;
}) {
  const uploadFile = useCaseStore((s) => s.uploadFile);
  const hasFile = !!caseDoc.file;

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const handle = await readFileAsDataUrl(file);
      uploadFile(caseId, caseDoc.id, handle);
    },
    [caseId, caseDoc.id, uploadFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const handle = await readFileAsDataUrl(file);
      uploadFile(caseId, caseDoc.id, handle);
    },
    [caseId, caseDoc.id, uploadFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`group relative rounded-xl border-2 border-dashed p-4 transition-all ${
        hasFile
          ? 'border-primary/30 bg-primary/3'
          : 'border-black/10 bg-white hover:border-primary/30 hover:bg-primary/2'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            hasFile ? 'bg-primary/10 text-primary' : 'bg-black/5 text-black/30'
          }`}
        >
          {hasFile ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-semibold text-black/85">{docType.label}</div>
          {hasFile && caseDoc.file && (
            <div className="text-sm text-primary/70">
              {caseDoc.file.name} ({formatFileSize(caseDoc.file.size)})
            </div>
          )}
        </div>
        {hasFile && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">완료</span>
        )}
      </div>
      {!hasFile && (
        <input
          type="file"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleFileSelect}
          accept="image/*,.pdf"
        />
      )}
      {hasFile && (
        <label className="absolute inset-0 cursor-pointer opacity-0">
          <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*,.pdf" />
        </label>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  iconBg,
  iconColor,
  docs,
  caseId,
  onAddCustom,
}: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  docs: DocWithType[];
  caseId: string;
  onAddCustom: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const doneCount = docs.filter((d) => d.caseDoc.file).length;

  return (
    <div className="rounded-xl border border-black/5 bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2.5 p-5 text-left"
      >
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <h3 className="text-[15px] font-bold text-black/70">{title}</h3>
        <span className="ml-auto mr-2 text-sm text-black/30">
          {doneCount}/{docs.length}
        </span>
        <svg
          className={`h-4 w-4 text-black/30 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-3 px-5 pb-5">
          {docs.map(({ caseDoc, docType }) => (
            <DocumentSlot key={caseDoc.id} docType={docType} caseDoc={caseDoc} caseId={caseId} />
          ))}
          <button
            onClick={onAddCustom}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/8 py-3 text-[14px] font-medium text-black/30 hover:border-primary/30 hover:text-primary/60 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            서류 직접 추가
          </button>
        </div>
      )}
    </div>
  );
}

function AddDocumentModal({
  isOpen,
  onAdd,
  onClose,
}: {
  isOpen: boolean;
  onAdd: (label: string) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState('');

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="서류 추가">
      <input
        autoFocus
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && label.trim()) {
            onAdd(label.trim());
          }
        }}
        placeholder="서류 이름 입력 (예: 자격증 사본)"
        className={INPUT_CLASS}
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-black/40 hover:bg-black/5 transition-colors"
        >
          취소
        </button>
        <button
          onClick={() => label.trim() && onAdd(label.trim())}
          disabled={!label.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-primary-dark transition-colors"
        >
          추가
        </button>
      </div>
    </ModalOverlay>
  );
}

const INPUT_CLASS =
  'w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-[15px] text-black/80 placeholder:text-black/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';

export default function UploadStep({ caseData, onNext }: UploadStepProps) {
  const setManualField = useCaseStore((s) => s.setManualField);
  const addCustomDocument = useCaseStore((s) => s.addCustomDocument);

  const [addModalCategory, setAddModalCategory] = useState<'foreigner' | 'company' | null>(null);

  const docsWithType = useMemo(
    () => resolveDocsWithType(caseData).filter((d) => d.docType.source === 'upload'),
    [caseData]
  );

  const foreignerDocs = docsWithType.filter((d) => d.docType.category === 'foreigner');
  const companyDocs = docsWithType.filter((d) => d.docType.category === 'company');

  const doneUpload = docsWithType.filter((d) => d.caseDoc.file).length;
  const totalUpload = docsWithType.length;
  const hasAnyUpload = doneUpload > 0;

  const handleAddCustom = (label: string) => {
    if (addModalCategory) {
      addCustomDocument(caseData.id, label, addModalCategory);
      setAddModalCategory(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-black/90">
          서류만 올리면,<br />
          자동으로 공문서가 완성돼요
        </h2>
        <p className="mt-3 text-base text-black/45">
          업로드한 서류에서 정보를 자동 추출해 신청서를 작성합니다
        </p>
      </div>

      {caseData.visaType === 'E-7' && (
        <div className="mb-6 rounded-xl bg-white border border-black/5 p-6 shadow-sm">
          <h3 className="mb-5 text-base font-bold tracking-tight text-black/75">전문인력 정보</h3>
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-black/55">전공</label>
              <input
                type="text"
                value={caseData.manualFields?.specialist_major ?? ''}
                onChange={(e) => setManualField(caseData.id, 'specialist_major', e.target.value)}
                placeholder="예: 전자공학, 컴퓨터공학"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-black/55">자격 직종</label>
              <input
                type="text"
                value={caseData.manualFields?.specialist_role ?? ''}
                onChange={(e) => setManualField(caseData.id, 'specialist_role', e.target.value)}
                placeholder="예: 소프트웨어 개발자, 용접 기능사"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-black/55">담당 직무</label>
              <input
                type="text"
                value={caseData.manualFields?.specialist_duty ?? ''}
                onChange={(e) => setManualField(caseData.id, 'specialist_duty', e.target.value)}
                placeholder="예: 백엔드 개발, CAD 설계"
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>
      )}

      {doneUpload > 0 && (
        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-medium text-black/40">
            {doneUpload}/{totalUpload}개 업로드 완료
          </span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <CollapsibleSection
          title="외국인 서류"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          }
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          docs={foreignerDocs}
          caseId={caseData.id}
          onAddCustom={() => setAddModalCategory('foreigner')}
        />

        <CollapsibleSection
          title="사업체 서류"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m16.5-18v18M5.25 3h13.5M5.25 21V10.5m0 0h4.5m-4.5 0V3m13.5 7.5V3m0 7.5h-4.5m4.5 0V21" />
            </svg>
          }
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          docs={companyDocs}
          caseId={caseData.id}
          onAddCustom={() => setAddModalCategory('company')}
        />
      </div>

      <AddDocumentModal
        isOpen={!!addModalCategory}
        onAdd={handleAddCustom}
        onClose={() => setAddModalCategory(null)}
      />

      <div className="mt-8 flex items-center justify-between">
        {!hasAnyUpload && (
          <span className="text-sm text-black/30">
            서류 없이도 다음 단계로 넘어갈 수 있습니다
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          {!hasAnyUpload && (
            <button
              onClick={onNext}
              className="rounded-xl border border-black/10 px-6 py-3 text-[15px] font-medium text-black/50 hover:bg-black/3 transition-all"
            >
              건너뛰기
            </button>
          )}
          <button
            onClick={onNext}
            className={`rounded-xl px-8 py-3 text-[15px] font-semibold transition-all ${
              hasAnyUpload
                ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark'
                : 'bg-primary/80 text-white hover:bg-primary'
            }`}
          >
            다음: 추가 정보 입력 →
          </button>
        </div>
      </div>
    </div>
  );
}
