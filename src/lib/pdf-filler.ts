// Re-export wrapper for backward compatibility
// New code should import from '@/lib/pdf/pdf-filler'

import type { Case } from '@/types/case';
import '@/lib/pdf/forms'; // ensure all forms are registered
import { getForm } from '@/lib/pdf/form-registry';
import { fillFormPdf, fillAndDownloadForm } from '@/lib/pdf/pdf-filler';

/** @deprecated Use fillFormPdf(formDef, caseData) from '@/lib/pdf/pdf-filler' */
export async function fillApplicationPdf(caseData: Case): Promise<Uint8Array> {
  const formDef = getForm('unified_application');
  if (!formDef) throw new Error('unified_application form not registered');
  return fillFormPdf(formDef, caseData);
}

/** @deprecated Use fillAndDownloadForm(formDef, caseData) from '@/lib/pdf/pdf-filler' */
export async function fillAndDownloadPdf(caseData: Case): Promise<void> {
  const formDef = getForm('unified_application');
  if (!formDef) throw new Error('unified_application form not registered');
  return fillAndDownloadForm(formDef, caseData);
}
