'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCaseStore } from '@/store/case-store';
import { useAuthStore } from '@/store/auth-store';
import { resolveDocsWithType } from '@/lib/document-registry';
import { D2_STUDENT_DOC_IDS } from '@/lib/document-registry';
import {
  getProvidersForVisa,
  getProviderStyles,
} from '@/lib/provider-registry';
import type { DocumentProvider, ProviderIcon as ProviderIconType } from '@/lib/provider-registry';
import { hasFiles } from '@/types/case';
import type { Case } from '@/types/case';
import AuthModal from '@/components/auth/AuthModal';
import TextInputModal, { INPUT_CLASS } from '@/components/shared/TextInputModal';
import Toast from '@/components/shared/Toast';
import ProviderIcon from './ProviderIcon';
import ProviderColumn from './ProviderColumn';
import StudentDocSection from './StudentDocSection';

interface UploadStepProps {
  caseData: Case;
  onNext: () => void;
}

export default function UploadStep({ caseData, onNext }: UploadStepProps) {
  const setManualField = useCaseStore((s) => s.setManualField);
  const addCustomDocument = useCaseStore((s) => s.addCustomDocument);
  const deleteDocument = useCaseStore((s) => s.deleteDocument);
  const updateDocumentLabel = useCaseStore((s) => s.updateDocumentLabel);

  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | null>(null);

  const [addModalProvider, setAddModalProvider] = useState<DocumentProvider | null>(null);
  const [editingDoc, setEditingDoc] = useState<{ id: string; label: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; subMessage?: string } | null>(null);

  const createShareLink = useCaseStore((s) => s.createShareLink);

  const handleCopyLink = useCallback(async (providerId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      let token = caseData.shareLinks?.[providerId]?.token;
      if (!token) {
        const result = await createShareLink(caseData.id, providerId);
        token = result.token;
      }
      const link = `${baseUrl}/submit/${token}`;
      await navigator.clipboard.writeText(link);
      setToast({ message: '서류 요청 링크가 복사되었습니다' });
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast({ message: '링크 생성에 실패했습니다' });
      setTimeout(() => setToast(null), 2000);
    }
  }, [caseData.id, caseData.shareLinks, createShareLink]);

  const docsWithType = useMemo(
    () => resolveDocsWithType(caseData).filter((d) => d.docType.source === 'upload'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caseData.documents, caseData.visaType, caseData.applicationType]
  );
  const isD2 = caseData.visaType === 'D-2';
  const providers = getProvidersForVisa(caseData.visaType);

  const handleCopyAllLinks = useCallback(async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const activeProviders = providers.filter((p) => {
      if (isD2 && p.id === 'd2-student') return false;
      return p.docTypeIds.some((id) => docsWithType.some((d) => d.docType.id === id));
    });
    try {
      const lines = await Promise.all(
        activeProviders.map(async (p) => {
          let token = caseData.shareLinks?.[p.id]?.token;
          if (!token) {
            const result = await createShareLink(caseData.id, p.id);
            token = result.token;
          }
          return `[${p.label}] ${baseUrl}/submit/${token}`;
        }),
      );
      await navigator.clipboard.writeText(lines.join('\n'));
      setToast({ message: '전체 서류 요청 링크가 복사되었습니다' });
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast({ message: '링크 생성에 실패했습니다' });
      setTimeout(() => setToast(null), 2000);
    }
  }, [caseData.id, caseData.shareLinks, providers, isD2, docsWithType, createShareLink]);

  // Provider별로 문서를 그룹핑
  const { providerGroups, studentDocs, unmappedDocs, doneUpload, totalUpload } = useMemo(() => {
    const groups = providers.map((provider) => {
      const docs = docsWithType.filter((d) => {
        if (isD2 && provider.id === 'd2-student') return false;
        return provider.docTypeIds.includes(d.docType.id)
          || (d.caseDoc.isCustom && d.caseDoc.customCategory === provider.defaultCategory);
      });
      return { provider, docs };
    });

    const sDocs = isD2
      ? docsWithType.filter((d) => D2_STUDENT_DOC_IDS.includes(d.docType.id))
      : [];

    const allProviderDocIds = new Set(providers.flatMap((p) => p.docTypeIds));
    const uDocs = docsWithType.filter(
      (d) => !allProviderDocIds.has(d.docType.id)
        && !(d.caseDoc.isCustom && providers.some(p => p.defaultCategory === d.caseDoc.customCategory))
        && !(isD2 && D2_STUDENT_DOC_IDS.includes(d.docType.id))
    );

    const done = docsWithType.filter((d) => hasFiles(d.caseDoc)).length;

    return {
      providerGroups: groups,
      studentDocs: sDocs,
      unmappedDocs: uDocs,
      doneUpload: done,
      totalUpload: docsWithType.length,
    };
  }, [docsWithType, providers, isD2]);

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
          <StudentDocSection docs={studentDocs} />
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
                  shareToken={caseData.shareLinks?.[provider.id]?.token}
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
                  icon: 'briefcase' as ProviderIconType,
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

      {/* Bottom buttons */}
      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          onClick={() => {
            if (user) {
              router.push('/dashboard');
            } else {
              setAuthModalTab('login');
            }
          }}
          className="rounded-xl border border-black/10 px-6 py-3 text-[15px] font-medium text-black/50 hover:bg-black/3 transition-all"
        >
          대시보드에서 대기
        </button>
        <button
          onClick={onNext}
          className="rounded-xl bg-primary px-8 py-3 text-[15px] font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all"
        >
          서류 업로드 완료 →
        </button>
      </div>

      {/* Auth modal for dashboard redirect */}
      {authModalTab && (
        <AuthModal
          isOpen
          onClose={() => {
            setAuthModalTab(null);
            if (useAuthStore.getState().user) {
              router.push('/dashboard');
            }
          }}
          initialTab={authModalTab}
        />
      )}

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
