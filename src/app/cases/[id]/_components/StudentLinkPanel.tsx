'use client';

import { useState } from 'react';
import { hasFiles } from '@/types/case';
import type { Case } from '@/types/case';
import { D2_STUDENT_FIELDS, D2_STUDENT_DOC_IDS, getStudentDocuments } from '@/lib/document-registry';

interface StudentLinkPanelProps {
  caseData: Case;
}

export default function StudentLinkPanel({ caseData }: StudentLinkPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!caseData.studentLinkToken) return null;

  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/submit/${caseData.studentLinkToken}`;
  const hasSubmission = !!caseData.studentSubmission;

  const studentDocs = getStudentDocuments();
  const uploadedStudentDocs = caseData.documents.filter(
    (d) => D2_STUDENT_DOC_IDS.includes(d.typeId) && hasFiles(d)
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      {/* 링크 공유 영역 */}
      <div className="flex items-start gap-4 mb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-black/80">학생 서류 제출 링크</h3>
          <p className="mt-1 text-sm text-black/40">
            이 링크를 학생에게 전달하면, 학생이 직접 서류를 제출할 수 있습니다
          </p>
        </div>
      </div>

      {/* 링크 복사 */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1 rounded-xl border border-black/8 bg-[#F8F9FA] px-4 py-3 text-sm text-black/50 truncate font-mono">
          {link}
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          {copied ? '복사됨' : '링크 복사'}
        </button>
      </div>

      {/* 제출 상태 */}
      {hasSubmission ? (
        <div className="rounded-xl border border-green-100 bg-green-50/50 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-green-700">학생이 서류를 제출했습니다</span>
            <span className="ml-auto text-xs text-green-600/60">
              {new Date(caseData.studentSubmission!.submittedAt).toLocaleDateString('ko-KR')}
            </span>
          </div>

          {/* 제출된 정보 미리보기 */}
          <div className="grid gap-2 sm:grid-cols-2">
            {D2_STUDENT_FIELDS.filter((f) => caseData.manualFields[f.id]).map((field) => (
              <div key={field.id} className="flex items-center gap-2 text-sm">
                <span className="text-green-600/60">{field.label}:</span>
                <span className="font-medium text-green-800/80">{caseData.manualFields[field.id]}</span>
              </div>
            ))}
          </div>

          {/* 제출된 서류 */}
          {uploadedStudentDocs.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-200/50">
              <div className="flex flex-wrap gap-2">
                {uploadedStudentDocs.map((doc) => {
                  const docDef = studentDocs.find((d) => d.id === doc.typeId);
                  return (
                    <span key={doc.id} className="rounded-lg bg-green-100/80 px-2.5 py-1 text-xs font-medium text-green-700">
                      {docDef?.label ?? doc.typeId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
