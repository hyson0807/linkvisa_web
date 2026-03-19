'use client';

import { useCallback, useState } from 'react';
import { useCaseStore } from '@/store/case-store';
import { formatFileSize } from '@/lib/file-utils';
import { hasFiles, latestFile } from '@/types/case';
import type { DocumentTypeDef, CaseDocument } from '@/types/case';

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

export default DocumentSlot;
