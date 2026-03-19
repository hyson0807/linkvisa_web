'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatFileSize } from '@/lib/file-utils';

export interface FileInfo {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface DocumentUploadCardProps {
  docId: string;
  label: string;
  existingFile?: FileInfo;
  onUpload: (docId: string, file: File) => Promise<void>;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function DocumentUploadCard({
  docId,
  label,
  existingFile,
  onUpload,
}: DocumentUploadCardProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileInfo | undefined>(existingFile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > MAX_FILE_SIZE) {
        setError('파일 크기는 20MB를 초과할 수 없습니다');
        return;
      }

      // Revoke previous blob URL before creating a new one
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

      // Preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        previewUrlRef.current = url;
        setPreviewUrl(url);
      } else {
        previewUrlRef.current = null;
        setPreviewUrl(null);
      }

      setUploading(true);
      try {
        await onUpload(docId, file);
        setUploadedFile({
          id: '',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : '업로드에 실패했습니다');
        setPreviewUrl(null);
      } finally {
        setUploading(false);
      }
    },
    [docId, onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFile],
  );

  const hasFile = !!uploadedFile;

  // Parse label to separate main text from parenthetical
  const labelMatch = label.match(/^(.+?)\s*(\(.+\))$/);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`group relative cursor-pointer rounded-xl border-2 border-dashed p-5 transition-all ${
        uploading
          ? 'border-primary/40 bg-primary/5'
          : hasFile
            ? 'border-green-300 bg-green-50/50'
            : dragOver
              ? 'border-primary/50 bg-primary/5'
              : 'border-black/10 bg-white hover:border-primary/30 hover:bg-primary/[0.02]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
      />

      <div className="flex items-center gap-3">
        {/* Icon / Preview */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden ${
            uploading
              ? 'bg-primary/10'
              : hasFile
                ? 'bg-green-100'
                : 'bg-black/[0.04]'
          }`}
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : hasFile && previewUrl ? (
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          ) : hasFile ? (
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-black/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-black/80 leading-snug">
            {labelMatch ? (
              <>
                {labelMatch[1]}
                <br />
                <span className="text-[13px] font-medium text-black/40">{labelMatch[2]}</span>
              </>
            ) : (
              label
            )}
          </div>
          {hasFile && uploadedFile && (
            <p className="mt-0.5 text-[13px] text-green-600/80 truncate">
              {uploadedFile.fileName} ({formatFileSize(uploadedFile.fileSize)})
            </p>
          )}
          {!hasFile && !uploading && (
            <p className="mt-0.5 text-[13px] text-black/30">파일을 드래그하거나 클릭하세요</p>
          )}
          {error && (
            <p className="mt-0.5 text-[13px] text-red-500">{error}</p>
          )}
        </div>

        {/* Status badge */}
        {hasFile && (
          <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-[13px] font-medium text-green-600">
            완료
          </span>
        )}
      </div>

      {/* Re-upload hint on hover */}
      {hasFile && !uploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[14px] font-medium text-primary">다시 업로드</span>
        </div>
      )}
    </div>
  );
}
