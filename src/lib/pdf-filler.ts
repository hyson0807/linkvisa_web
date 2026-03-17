import { PDFDocument, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { Case } from '@/types/case';
import {
  textFieldMappings,
  checkboxMappings,
  resolveSource,
  applyTransform,
} from './pdf-field-map';

const PDF_PATH = '/forms/application_form.pdf';
const FONT_PATH = '/fonts/NanumGothic-Regular.ttf';

let cachedFont: ArrayBuffer | null = null;
let cachedTemplate: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;
  const res = await fetch(FONT_PATH);
  if (!res.ok) throw new Error(`Failed to load font: ${res.status}`);
  cachedFont = await res.arrayBuffer();
  return cachedFont;
}

async function loadTemplate(): Promise<ArrayBuffer> {
  if (cachedTemplate) return cachedTemplate;
  const res = await fetch(PDF_PATH);
  if (!res.ok) throw new Error(`Failed to load PDF template: ${res.status}`);
  cachedTemplate = await res.arrayBuffer();
  return cachedTemplate;
}

export async function fillApplicationPdf(caseData: Case): Promise<Uint8Array> {
  const [templateBytes, fontBytes] = await Promise.all([loadTemplate(), loadFont()]);

  const pdfDoc = await PDFDocument.load(templateBytes);

  pdfDoc.registerFontkit(fontkit);
  let koreanFont: PDFFont | undefined;
  try {
    koreanFont = await pdfDoc.embedFont(fontBytes, { subset: false });
  } catch {
    // Fallback: proceed without Korean font
  }

  const form = pdfDoc.getForm();

  // Fill text fields
  for (const mapping of textFieldMappings) {
    try {
      const rawValue = resolveSource(caseData, mapping.source);
      const value = applyTransform(rawValue, mapping.transform, mapping.digitIndex);
      if (!value) continue;

      const textField = form.getTextField(mapping.field);
      textField.setText(value);
      if (koreanFont) {
        textField.updateAppearances(koreanFont);
      }
    } catch {
      // Field might not exist in this version of the PDF — skip silently
    }
  }

  // Fill checkboxes
  for (const mapping of checkboxMappings) {
    try {
      if (mapping.condition(caseData)) {
        form.getCheckBox(mapping.field).check();
      }
    } catch {
      // Skip missing fields
    }
  }

  // flatten() can fail with "Could not find page for PDFRef" on some PDFs.
  // Instead, mark all fields read-only to lock values without flattening.
  for (const field of form.getFields()) {
    field.enableReadOnly();
  }
  return pdfDoc.save();
}

function buildFileName(caseData: Case): string {
  const name = caseData.foreignerName?.replace(/\s+/g, '_') || 'applicant';
  return `통합신청서_${name}.pdf`;
}

export async function fillAndDownloadPdf(caseData: Case): Promise<void> {
  const pdfBytes = await fillApplicationPdf(caseData);

  const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = buildFileName(caseData);
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
