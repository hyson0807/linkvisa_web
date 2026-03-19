'use client';

import { formatFileSize } from '@/lib/file-utils';
import { hasFiles, latestFile } from '@/types/case';
import type { DocWithType } from '@/types/case';

function StudentDocSection({ docs }: { docs: DocWithType[] }) {
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

export default StudentDocSection;
