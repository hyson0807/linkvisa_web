'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Case } from '@/types/case';
import '@/lib/pdf/forms'; // ensure all forms are registered
import { getFormsForCase } from '@/lib/pdf/form-registry';
import type { FormDefinition } from '@/lib/pdf/form-registry';
import { fillAndDownloadForm } from '@/lib/pdf/pdf-filler';

export function usePdfDownload(caseData: Case) {
  const [downloading, setDownloading] = useState(false);
  const [downloadingFormId, setDownloadingFormId] = useState<string | null>(null);

  const forms = useMemo(() => getFormsForCase(caseData), [caseData]);

  const downloadForm = useCallback(async (formId: string) => {
    const formDef = forms.find((f) => f.id === formId);
    if (!formDef) return;
    setDownloading(true);
    setDownloadingFormId(formId);
    try {
      await fillAndDownloadForm(formDef, caseData);
    } catch (err) {
      console.error(`PDF download failed for ${formId}:`, err);
      alert('PDF 다운로드에 실패했습니다.');
    } finally {
      setDownloading(false);
      setDownloadingFormId(null);
    }
  }, [forms, caseData]);

  const downloadAll = useCallback(async () => {
    setDownloading(true);
    try {
      for (const formDef of forms) {
        // Skip forms with no mappings (stub only)
        if (formDef.textFieldMappings.length === 0 && formDef.checkboxMappings.length === 0) continue;
        setDownloadingFormId(formDef.id);
        await fillAndDownloadForm(formDef, caseData);
      }
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('PDF 다운로드에 실패했습니다.');
    } finally {
      setDownloading(false);
      setDownloadingFormId(null);
    }
  }, [forms, caseData]);

  // Legacy: single-form download (통합신청서)
  const download = useCallback(async () => {
    await downloadForm('unified_application');
  }, [downloadForm]);

  return { forms, downloading, downloadingFormId, download, downloadForm, downloadAll };
}
