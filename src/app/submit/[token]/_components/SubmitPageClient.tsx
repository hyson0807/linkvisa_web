'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getShareLinkInfo,
  uploadViaShareLink,
} from '@/lib/share-link-api';
import type { ShareLinkPageInfo } from '@/lib/share-link-api';
import { ApiError } from '@/lib/api';
import { documentRegistry } from '@/lib/document-registry';
import { getProvidersForVisa } from '@/lib/provider-registry';
import UploadPageHeader from './UploadPageHeader';
import DocumentUploadGrid from './DocumentUploadGrid';

interface SubmitPageClientProps {
  token: string;
}

type PageState =
  | { type: 'loading' }
  | { type: 'error'; status: number; message: string }
  | { type: 'ready'; data: ShareLinkPageInfo };

export default function SubmitPageClient({ token }: SubmitPageClientProps) {
  const [state, setState] = useState<PageState>({ type: 'loading' });
  const [uploadedDocIds, setUploadedDocIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getShareLinkInfo(token)
      .then((data) => {
        setState({ type: 'ready', data });
        // Mark already-uploaded docs
        const uploaded = new Set<string>();
        for (const doc of data.documents) {
          if (doc.files.length > 0) uploaded.add(doc.id);
        }
        setUploadedDocIds(uploaded);
      })
      .catch((err) => {
        const status = err instanceof ApiError ? err.status : 404;
        const message =
          status === 410
            ? '링크가 만료되었습니다. 새 링크를 요청해 주세요.'
            : '유효하지 않은 링크입니다';
        setState({ type: 'error', status, message });
      });
  }, [token]);

  const handleUpload = useCallback(
    async (docId: string, file: File) => {
      await uploadViaShareLink(token, docId, file);
      setUploadedDocIds((prev) => new Set(prev).add(docId));
    },
    [token],
  );

  if (state.type === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-[15px] text-black/40">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (state.type === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="text-center px-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-black/80">{state.message}</h2>
          <p className="mt-2 text-[14px] text-black/40">
            링크를 보내주신 분에게 새 링크를 요청해 주세요.
          </p>
        </div>
      </div>
    );
  }

  const { data } = state;

  return (
    <SubmitPageReady
      data={data}
      uploadedDocIds={uploadedDocIds}
      onUpload={handleUpload}
    />
  );
}

function SubmitPageReady({
  data,
  uploadedDocIds,
  onUpload,
}: {
  data: ShareLinkPageInfo;
  uploadedDocIds: Set<string>;
  onUpload: (docId: string, file: File) => Promise<void>;
}) {
  // Resolve provider once
  const provider = useMemo(() => {
    const providers = getProvidersForVisa(data.visaType);
    return providers.find((p) => p.id === data.providerId);
  }, [data.visaType, data.providerId]);

  const providerLabel = provider?.label ?? '서류';

  // Filter documents to only those belonging to this provider
  const filteredDocs = useMemo(() => {
    if (!provider) return data.documents;
    const providerDocTypeIds = new Set(provider.docTypeIds);
    return data.documents.filter(
      (doc) =>
        providerDocTypeIds.has(doc.typeId) ||
        (doc.isCustom && doc.customCategory === provider.defaultCategory),
    );
  }, [data.documents, provider]);

  // Map documents to display items with labels
  const displayDocs = useMemo(() => {
    return filteredDocs.map((doc) => {
      const registryDef = documentRegistry.find((r) => r.id === doc.typeId);
      const label = doc.customLabel || registryDef?.label || doc.typeId;
      const latestFile = doc.files.length > 0 ? doc.files[doc.files.length - 1] : undefined;
      return {
        id: doc.id,
        label,
        existingFile: latestFile,
      };
    });
  }, [filteredDocs, uploadedDocIds]);

  const doneCount = filteredDocs.filter(
    (doc) => doc.files.length > 0 || uploadedDocIds.has(doc.id),
  ).length;

  const allDone = doneCount === filteredDocs.length && filteredDocs.length > 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <UploadPageHeader
          foreignerName={data.foreignerName}
          visaType={data.visaType}
          providerLabel={providerLabel}
          doneCount={doneCount}
          totalCount={filteredDocs.length}
        />

        {allDone && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="text-[15px] font-semibold text-green-700">
                모든 서류가 업로드되었습니다!
              </span>
            </div>
          </div>
        )}

        <DocumentUploadGrid documents={displayDocs} onUpload={onUpload} />

        <p className="mt-8 text-center text-[13px] text-black/30">
          업로드된 파일은 담당 행정사에게 안전하게 전달됩니다
        </p>
      </div>
    </div>
  );
}
