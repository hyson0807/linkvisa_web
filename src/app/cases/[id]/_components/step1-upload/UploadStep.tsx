'use client';

import { useCallback, useMemo, useState } from 'react';
import { useCaseStore } from '@/store/case-store';
import { resolveDocsWithType } from '@/lib/document-registry';
import { formatFileSize } from '@/lib/file-utils';
import { D2_STUDENT_DOC_IDS } from '@/lib/document-registry';
import {
  getProvidersForVisa,
  getProviderForDoc,
  getProviderStyles,
} from '@/lib/provider-registry';
import type { DocumentProvider, ProviderIcon } from '@/lib/provider-registry';
import { hasFiles, latestFile } from '@/types/case';
import type { Case, DocWithType, DocumentTypeDef, CaseDocument } from '@/types/case';

interface UploadStepProps {
  caseData: Case;
  onNext: () => void;
}

function ProviderIcon({ icon }: { icon: ProviderIcon }) {
  switch (icon) {
    case 'person':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
        </svg>
      );
    case 'building':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m16.5-18v18M5.25 3h13.5M5.25 21V10.5m0 0h4.5m-4.5 0V3m13.5 7.5V3m0 7.5h-4.5m4.5 0V21" />
        </svg>
      );
    case 'school':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
        </svg>
      );
    case 'heart':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      );
    case 'couple':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      );
    case 'photo':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
      );
    case 'gov':
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
        </svg>
      );
    default:
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      );
  }
}

function DocumentSlot({
  docType,
  caseDoc,
  caseId,
  onDelete,
  onEditLabel,
}: {
  docType: DocumentTypeDef;
  caseDoc: CaseDocument;
  caseId: string;
  onDelete: (docId: string) => void;
  onEditLabel: (docId: string, currentLabel: string) => void;
}) {
  const uploadFile = useCaseStore((s) => s.uploadFile);
  const removeFile = useCaseStore((s) => s.removeFile);
  const [uploading, setUploading] = useState(false);
  const hasFile = hasFiles(caseDoc);
  const lastFile = latestFile(caseDoc);

  const handleRemoveFile = useCallback(async () => {
    if (!lastFile) return;
    await removeFile(caseId, caseDoc.id, lastFile.id);
  }, [caseId, caseDoc.id, lastFile, removeFile]);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        await uploadFile(caseId, caseDoc.id, file);
      } finally {
        setUploading(false);
      }
    },
    [caseId, caseDoc.id, uploadFile]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      await handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`group relative rounded-xl border-2 border-dashed p-4 transition-all ${
        uploading
          ? 'border-primary/40 bg-primary/5'
          : hasFile
            ? 'border-primary/30 bg-primary/3'
            : 'border-black/10 bg-white hover:border-primary/30 hover:bg-primary/2'
      }`}
    >
      {/* X button — top right, deletes the document slot */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(caseDoc.id); }}
        className="absolute top-1.5 right-1.5 z-10 rounded-md p-1 text-black/20 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-400 transition-all"
        title="서류 삭제"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            uploading || hasFile ? 'bg-primary/10 text-primary' : 'bg-black/5 text-black/30'
          }`}
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : hasFile ? (
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
          <div className="truncate text-[17px] font-semibold text-black/85 leading-snug">
            {(() => {
              const m = docType.label.match(/^(.+?)\s*(\(.+\))$/);
              if (m) return <>{m[1]}<br /><span className="text-[15px] font-medium text-black/45">{m[2]}</span></>;
              return docType.label;
            })()}
          </div>
          {hasFile && lastFile && (
            <div className="flex items-center gap-1.5 text-sm text-primary/70">
              <span className="truncate">{lastFile.name} ({formatFileSize(lastFile.size)})</span>
            </div>
          )}
        </div>
        {hasFile && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">완료</span>
        )}
        {/* Edit/Remove file buttons — visible on hover */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 bg-white/90 rounded-lg px-1 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEditLabel(caseDoc.id, docType.label); }}
            className="rounded-lg p-1.5 text-black/25 hover:bg-black/5 hover:text-black/50 transition-colors"
            title="이름 수정"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
          </button>
          {hasFile && (
            <button
              onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
              className="rounded-lg p-1.5 text-black/25 hover:bg-red-50 hover:text-red-400 transition-colors"
              title="파일 제거"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {!hasFile && !uploading && (
        <input
          type="file"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleFileSelect}
          accept="image/*,.pdf"
        />
      )}
      {hasFile && (
        <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:pointer-events-none">
          <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*,.pdf" />
        </label>
      )}
    </div>
  );
}

function ProviderColumn({
  title,
  icon,
  iconBg,
  iconColor,
  docs,
  caseId,
  providerId,
  onAddCustom,
  onCopyLink,
  onDeleteDoc,
  onEditLabel,
}: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  docs: DocWithType[];
  caseId: string;
  providerId: string;
  onAddCustom: () => void;
  onCopyLink: (providerId: string) => void;
  onDeleteDoc: (docId: string) => void;
  onEditLabel: (docId: string, currentLabel: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const doneCount = docs.filter((d) => hasFiles(d.caseDoc)).length;

  const handleCopy = () => {
    onCopyLink(providerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/submit/${caseId}/${providerId}`
    : `/submit/${caseId}/${providerId}`;

  return (
    <div className="flex h-full flex-col">
      {/* 요청 링크 복사 카드 */}
      <div className={`mb-3 flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
        copied
          ? 'border-green-200 bg-green-50'
          : 'border-primary/10 bg-primary/[0.02] hover:border-primary/20 hover:bg-primary/[0.04]'
      }`}>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          copied ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
        }`}>
          {copied ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-black/60">
            {linkUrl}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          {copied ? '복사됨' : '링크 복사'}
        </button>
      </div>

      {/* Card */}
      <div className="flex flex-1 flex-col rounded-2xl border border-black/5 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-black/5 px-5 py-4">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
            {icon}
          </div>
          <h3 className="text-[15px] font-bold text-black/70">{title}</h3>
          <span className="ml-auto text-sm font-medium text-black/30">
            {doneCount}/{docs.length}
          </span>
        </div>

      {/* Document list */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {docs.map(({ caseDoc, docType }) => (
          <DocumentSlot key={caseDoc.id} docType={docType} caseDoc={caseDoc} caseId={caseId} onDelete={onDeleteDoc} onEditLabel={onEditLabel} />
        ))}
        <button
          onClick={onAddCustom}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/8 py-3 text-[14px] font-medium text-black/30 hover:border-primary/30 hover:text-primary/60 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          서류 직접 추가
        </button>
      </div>
      </div>
    </div>
  );
}

function StudentDocSection({ docs, caseId }: { docs: DocWithType[]; caseId: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white shadow-sm">
      <div className="flex w-full items-center gap-2.5 p-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
        </div>
        <h3 className="text-[15px] font-bold text-black/70">학생 제출 서류</h3>
        <span className="ml-auto mr-2 text-sm text-black/30">
          {docs.filter((d) => hasFiles(d.caseDoc)).length}/{docs.length}
        </span>
      </div>
      <div className="space-y-3 px-5 pb-5">
        {docs.map(({ caseDoc, docType }) => {
          const docHasFiles = hasFiles(caseDoc);
          const lastFile = latestFile(caseDoc);
          return (
          <div key={caseDoc.id} className={`rounded-xl border p-4 ${
            docHasFiles
              ? 'border-green-200 bg-green-50/50'
              : 'border-black/8 bg-black/[0.02]'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                docHasFiles ? 'bg-green-100 text-green-600' : 'bg-black/5 text-black/25'
              }`}>
                {docHasFiles ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-black/80">{docType.label}</div>
                <div className="text-sm text-black/35">
                  {docHasFiles && lastFile ? `${lastFile.name} (${formatFileSize(lastFile.size)})` : '학생 제출 대기'}
                </div>
              </div>
              {docHasFiles && (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-600">제출됨</span>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function TextInputModal({
  title,
  placeholder,
  submitLabel,
  initialValue = '',
  onSubmit,
  onClose,
}: {
  title: string;
  placeholder: string;
  submitLabel: string;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-black/85 mb-4">{title}</h3>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) onSubmit(value.trim());
          }}
          placeholder={placeholder}
          className={INPUT_CLASS}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-black/40 hover:bg-black/5 transition-colors">
            취소
          </button>
          <button
            onClick={() => value.trim() && onSubmit(value.trim())}
            disabled={!value.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-primary-dark transition-colors"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const INPUT_CLASS =
  'w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-[15px] text-black/80 placeholder:text-black/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';

function Toast({ message, subMessage, onClose }: { message: string; subMessage?: string; onClose: () => void }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[fadeInUp_0.3s_ease-out] rounded-xl bg-black/85 px-5 py-3 shadow-lg"
      onClick={onClose}
    >
      <div className="flex items-center gap-2">
        <span className="text-[14px]">📋</span>
        <span className="text-[14px] font-medium text-white">{message}</span>
      </div>
      {subMessage && (
        <p className="mt-1 text-[12px] text-white/60 pl-6">{subMessage}</p>
      )}
    </div>
  );
}

export default function UploadStep({ caseData, onNext }: UploadStepProps) {
  const setManualField = useCaseStore((s) => s.setManualField);
  const addCustomDocument = useCaseStore((s) => s.addCustomDocument);
  const deleteDocument = useCaseStore((s) => s.deleteDocument);
  const updateDocumentLabel = useCaseStore((s) => s.updateDocumentLabel);

  const [addModalProvider, setAddModalProvider] = useState<DocumentProvider | null>(null);
  const [editingDoc, setEditingDoc] = useState<{ id: string; label: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; subMessage?: string } | null>(null);

  const handleCopyLink = useCallback((providerId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/submit/${caseData.id}/${providerId}`;
    navigator.clipboard.writeText(link).then(() => {
      setToast({ message: '서류 요청 링크가 복사되었습니다' });
      setTimeout(() => setToast(null), 2000);
    });
  }, [caseData.id]);

  const docsWithType = useMemo(
    () => resolveDocsWithType(caseData).filter((d) => d.docType.source === 'upload'),
    [caseData]
  );
  const isD2 = caseData.visaType === 'D-2';
  const providers = getProvidersForVisa(caseData.visaType);

  const handleCopyAllLinks = useCallback(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const activeProviders = providers.filter((p) => {
      if (isD2 && p.id === 'd2-student') return false;
      return p.docTypeIds.some((id) => docsWithType.some((d) => d.docType.id === id));
    });
    const links = activeProviders.map((p) => `[${p.label}] ${baseUrl}/submit/${caseData.id}/${p.id}`).join('\n');
    navigator.clipboard.writeText(links).then(() => {
      setToast({ message: '전체 서류 요청 링크가 복사되었습니다' });
      setTimeout(() => setToast(null), 2000);
    });
  }, [caseData.id, providers, isD2, docsWithType]);

  // Provider별로 문서를 그룹핑
  const providerGroups = providers.map((provider) => {
    const docs = docsWithType.filter((d) => {
      // D-2의 학생 제출 서류 Provider는 StudentDocSection에서 별도 처리
      if (isD2 && provider.id === 'd2-student') return false;
      return provider.docTypeIds.includes(d.docType.id)
        || (d.caseDoc.isCustom && d.caseDoc.customCategory === provider.defaultCategory);
    });
    return { provider, docs };
  });

  // D-2: 학생 제출 서류 분리
  const studentDocs = isD2
    ? docsWithType.filter((d) => D2_STUDENT_DOC_IDS.includes(d.docType.id))
    : [];

  // Provider에 매핑되지 않은 문서 (커스텀 서류 등)
  const allProviderDocIds = new Set(providers.flatMap((p) => p.docTypeIds));
  const unmappedDocs = docsWithType.filter(
    (d) => !allProviderDocIds.has(d.docType.id)
      && !(d.caseDoc.isCustom && providers.some(p => p.defaultCategory === d.caseDoc.customCategory))
      && !(isD2 && D2_STUDENT_DOC_IDS.includes(d.docType.id))
  );

  const doneUpload = docsWithType.filter((d) => hasFiles(d.caseDoc)).length;
  const totalUpload = docsWithType.length;
  const hasAnyUpload = doneUpload > 0;

  const handleDeleteDoc = useCallback(async (docId: string) => {
    if (!confirm('이 서류를 삭제하시겠습니까? 업로드된 파일도 함께 삭제됩니다.')) return;
    await deleteDocument(caseData.id, docId);
    setToast({ message: '서류가 삭제되었습니다' });
    setTimeout(() => setToast(null), 2000);
  }, [caseData.id, deleteDocument]);

  const handleEditLabel = useCallback((docId: string, currentLabel: string) => {
    setEditingDoc({ id: docId, label: currentLabel });
  }, []);

  const handleSaveLabel = useCallback(async (label: string) => {
    if (!editingDoc) return;
    await updateDocumentLabel(caseData.id, editingDoc.id, label);
    setEditingDoc(null);
  }, [caseData.id, editingDoc, updateDocumentLabel]);

  const handleAddCustom = async (label: string) => {
    if (addModalProvider) {
      await addCustomDocument(caseData.id, label, addModalProvider.defaultCategory);
      setAddModalProvider(null);
    }
  };

  return (
    <div>
      {/* Specialist info inputs */}
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

      {/* Upload status summary */}
      {doneUpload > 0 && (
        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm font-medium text-black/40">
            {doneUpload}/{totalUpload}개 업로드 완료
          </span>
        </div>
      )}

      {/* D-2: 학생 제출 서류 (full width) */}
      {isD2 && studentDocs.length > 0 && (
        <div className="mb-4">
          <StudentDocSection docs={studentDocs} caseId={caseData.id} />
        </div>
      )}

      {/* Common instruction for submit links */}
      <div className="mb-4">
        <span className="text-[14px] font-semibold text-[#6B7280]">
          📨 서류 요청 링크 - 상대방에게 링크 전송만으로 편하게 서류를 업로드 받으세요
        </span>
      </div>

      {/* Provider-based document groups — horizontal grid */}
      {(() => {
        const activeGroups = providerGroups.filter(({ docs }) => docs.length > 0);
        const totalColumns = activeGroups.length + (unmappedDocs.length > 0 ? 1 : 0);
        const gridClass =
          totalColumns === 1
            ? 'grid grid-cols-1'
            : totalColumns === 2
              ? 'grid grid-cols-1 md:grid-cols-2'
              : 'grid grid-cols-1 md:grid-cols-3';
        return (
          <div className={`${gridClass} gap-4 items-start`}>
            {activeGroups.map(({ provider, docs }) => {
              const styles = getProviderStyles(provider.color);
              return (
                <ProviderColumn
                  key={provider.id}
                  title={provider.label}
                  icon={<ProviderIcon icon={provider.icon} />}
                  iconBg={styles.iconBg}
                  iconColor={styles.iconColor}
                  docs={docs}
                  caseId={caseData.id}
                  providerId={provider.id}
                  onAddCustom={() => setAddModalProvider(provider)}
                  onCopyLink={handleCopyLink}
                  onDeleteDoc={handleDeleteDoc}
                  onEditLabel={handleEditLabel}
                />
              );
            })}

            {/* Provider에 매핑되지 않은 커스텀 서류 */}
            {unmappedDocs.length > 0 && (
              <ProviderColumn
                title="기타 서류"
                icon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                }
                iconBg="bg-slate-100"
                iconColor="text-slate-500"
                docs={unmappedDocs}
                caseId={caseData.id}
                providerId="etc"
                onAddCustom={() => setAddModalProvider(providers[0] ?? {
                  id: 'fallback',
                  label: '기타',
                  icon: 'briefcase' as ProviderIcon,
                  color: 'slate' as const,
                  defaultCategory: 'foreigner' as const,
                  docTypeIds: [],
                })}
                onCopyLink={handleCopyLink}
                onDeleteDoc={handleDeleteDoc}
                onEditLabel={handleEditLabel}
              />
            )}
          </div>
        );
      })()}

      {/* Add document modal */}
      {addModalProvider && (
        <TextInputModal
          title="서류 추가"
          placeholder="서류 이름 입력 (예: 자격증 사본)"
          submitLabel="추가"
          onSubmit={handleAddCustom}
          onClose={() => setAddModalProvider(null)}
        />
      )}

      {/* Edit label modal */}
      {editingDoc && (
        <TextInputModal
          title="서류 이름 수정"
          placeholder="서류 이름"
          submitLabel="저장"
          initialValue={editingDoc.label}
          onSubmit={handleSaveLabel}
          onClose={() => setEditingDoc(null)}
        />
      )}

      {/* Next button */}
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

      {/* Footer notice */}
      <p className="mt-6 text-center text-[13px] text-black/30">
        ※ 업로드된 서류에서 정보를 자동 추출해 신청서를 작성합니다
      </p>

      {/* Toast message */}
      {toast && (
        <Toast message={toast.message} subMessage={toast.subMessage} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
