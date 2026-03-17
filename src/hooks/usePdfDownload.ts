'use client';

import { useState, useCallback } from 'react';
import type { Case } from '@/types/case';
import { fillAndDownloadPdf } from '@/lib/pdf-filler';

export function usePdfDownload(caseData: Case) {
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(async () => {
    setDownloading(true);
    try {
      await fillAndDownloadPdf(caseData);
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('PDF 다운로드에 실패했습니다.');
    } finally {
      setDownloading(false);
    }
  }, [caseData]);

  return { downloading, download };
}
