'use client';

interface UploadPageHeaderProps {
  foreignerName: string;
  visaType: string;
  providerLabel: string;
  doneCount: number;
  totalCount: number;
}

export default function UploadPageHeader({
  foreignerName,
  visaType,
  providerLabel,
  doneCount,
  totalCount,
}: UploadPageHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white text-lg font-bold">
        LV
      </div>
      <h1 className="text-2xl font-bold text-black/85">서류 업로드</h1>
      <p className="mt-2 text-[15px] text-black/50">
        {foreignerName} · {visaType}
      </p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="text-[14px] font-semibold text-black/60">{providerLabel}</span>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[13px] font-semibold text-primary">
          {doneCount}/{totalCount} 완료
        </span>
      </div>
    </div>
  );
}
