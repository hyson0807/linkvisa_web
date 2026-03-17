import { PDFDocument, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { Case } from '@/types/case';
import type { FormDefinition } from './form-registry';
import { resolveSource, applyTransform } from './field-utils';

const FONT_PATH = '/fonts/NanumGothic-Regular.ttf';

let cachedFont: ArrayBuffer | null = null;
const templateCache = new Map<string, ArrayBuffer>();

async function loadFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;
  const res = await fetch(FONT_PATH);
  if (!res.ok) throw new Error(`Failed to load font: ${res.status}`);
  cachedFont = await res.arrayBuffer();
  return cachedFont;
}

async function loadTemplate(templatePath: string): Promise<ArrayBuffer> {
  const cached = templateCache.get(templatePath);
  if (cached) return cached;
  const res = await fetch(templatePath);
  if (!res.ok) throw new Error(`Failed to load PDF template: ${res.status}`);
  const buf = await res.arrayBuffer();
  templateCache.set(templatePath, buf);
  return buf;
}

export async function fillFormPdf(formDef: FormDefinition, caseData: Case): Promise<Uint8Array> {
  const [templateBytes, fontBytes] = await Promise.all([
    loadTemplate(formDef.templatePath),
    loadFont(),
  ]);

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
  for (const mapping of formDef.textFieldMappings) {
    try {
      const manualOverride = caseData.manualFields?.[mapping.field];
      const rawValue = manualOverride || resolveSource(caseData, mapping.source);
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
  for (const mapping of formDef.checkboxMappings) {
    try {
      if (mapping.condition(caseData)) {
        form.getCheckBox(mapping.field).check();
      }
    } catch {
      // Skip missing fields
    }
  }

  // Mark all fields read-only to lock values
  for (const field of form.getFields()) {
    field.enableReadOnly();
  }
  return pdfDoc.save();
}

export async function fillAndDownloadForm(formDef: FormDefinition, caseData: Case): Promise<void> {
  const pdfBytes = await fillFormPdf(formDef, caseData);

  const blob = new Blob([pdfBytes as unknown as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = formDef.buildFileName(caseData);
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
