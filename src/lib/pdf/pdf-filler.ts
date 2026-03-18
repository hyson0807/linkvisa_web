import { PDFArray, PDFBool, PDFDict, PDFDocument, PDFFont, PDFName, PDFRef } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { Case } from '@/types/case';
import type { FormDefinition } from './form-registry';
import { resolveSource, applyTransform, formScopedKey } from './field-utils';

const FONT_PATH = '/fonts/NanumGothic-Regular.ttf';
const DEFAULT_MAX_FONT_SIZE = 10;
const DEFAULT_MIN_FONT_SIZE = 2;
const FIELD_PADDING = 1;
const MULTILINE_LINE_HEIGHT_RATIO = 1.2;
const FONT_SIZE_STEP = 0.25;

function clampFieldDimension(value: number): number {
  return Math.max(value, 1);
}

function splitLineToFit(
  line: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let remaining = line;

  while (remaining) {
    let fittedLength = 0;
    let currentWidth = 0;

    for (const char of remaining) {
      const charWidth = font.widthOfTextAtSize(char, fontSize);
      if (currentWidth + charWidth > maxWidth) break;
      currentWidth += charWidth;
      fittedLength += char.length;
    }

    if (fittedLength <= 0) {
      lines.push(remaining[0]);
      remaining = remaining.slice(remaining[0].length);
      continue;
    }

    let chunk = remaining.slice(0, fittedLength);
    const remainder = remaining.slice(fittedLength);
    const breakAtWhitespace = chunk.search(/\s\S*$/);

    if (remainder && breakAtWhitespace > 0) {
      const candidate = chunk.slice(0, breakAtWhitespace).trimEnd();
      if (candidate) {
        chunk = candidate;
        remaining = `${chunk.length < fittedLength ? remaining.slice(chunk.length) : remainder}`.trimStart();
        lines.push(chunk);
        continue;
      }
    }

    lines.push(chunk.trimEnd());
    remaining = remainder.trimStart();
  }

  return lines.length > 0 ? lines : [''];
}

function countWrappedLines(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): number {
  let totalLines = 0;
  for (const paragraph of text.split('\n')) {
    if (!paragraph) {
      totalLines += 1;
      continue;
    }
    totalLines += splitLineToFit(paragraph, font, fontSize, maxWidth).length;
  }
  return totalLines;
}

function roundFontSize(value: number): number {
  return Math.round(value * 100) / 100;
}

function calcSinglelineFontSize(
  text: string,
  font: PDFFont,
  fieldWidth: number,
  fieldHeight: number,
  maxSize: number,
  minSize: number,
): number {
  for (let size = maxSize; size >= minSize; size -= FONT_SIZE_STEP) {
    const width = font.widthOfTextAtSize(text, size);
    const height = font.heightAtSize(size);
    if (width <= fieldWidth && height <= fieldHeight) {
      return roundFontSize(size);
    }
  }
  return minSize;
}

function calcMultilineFontSize(
  text: string,
  font: PDFFont,
  fieldWidth: number,
  fieldHeight: number,
  maxSize: number,
  minSize: number,
): number {
  for (let size = maxSize; size >= minSize; size -= FONT_SIZE_STEP) {
    const lineHeight = font.heightAtSize(size) * MULTILINE_LINE_HEIGHT_RATIO;
    const lines = countWrappedLines(text, font, size, fieldWidth);
    if (lines * lineHeight <= fieldHeight) {
      return roundFontSize(size);
    }
  }
  return minSize;
}

const tfRegex = /(\/[^\0\t\n\f\r ]+)[\0\t\n\f\r ]+(\d*\.\d+|\d+)[\0\t\n\f\r ]+(Tf)/;

function getDefaultFontSize(da?: string): number | undefined {
  const match = da?.match(tfRegex);
  if (!match) return undefined;
  const fontSize = Number.parseFloat(match[2]);
  // Font size 0 in PDF DA means "auto-size" — treat as unset so DEFAULT_MAX_FONT_SIZE is used
  return Number.isFinite(fontSize) && fontSize > 0 ? fontSize : undefined;
}

function setWidgetFontSize(
  field: { acroField: { getWidgets(): { getDefaultAppearance(): string | undefined; setDefaultAppearance(da: string): void }[] } },
  fontSize: number,
) {
  for (const widget of field.acroField.getWidgets()) {
    const da = widget.getDefaultAppearance();
    if (!da) continue;
    const modified = da.replace(tfRegex, `$1 ${fontSize} $3`);
    if (modified !== da) widget.setDefaultAppearance(modified);
  }
}

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

function canFlattenForm(
  pdfDoc: PDFDocument,
  form: {
    getFields(): {
      acroField: {
        getWidgets(): {
          P(): unknown;
          dict: object;
        }[];
      };
    }[];
  },
): boolean {
  const pages = pdfDoc.getPages();

  for (const field of form.getFields()) {
    for (const widget of field.acroField.getWidgets()) {
      const pageRef = widget.P();
      if (pageRef && pages.some((page) => page.ref === pageRef)) continue;

      const widgetRef = pdfDoc.context.getObjectRef(widget.dict);
      if (widgetRef && pdfDoc.findPageForAnnotationRef(widgetRef)) continue;

      return false;
    }
  }

  return true;
}

function repairWidgetPageRefs(
  pdfDoc: PDFDocument,
  formDef: FormDefinition,
  form: {
    getFields(): {
      getName(): string;
      acroField: {
        getWidgets(): {
          P(): unknown;
          dict: { set(name: PDFName, value: unknown): void };
        }[];
      };
    }[];
  },
): void {
  const pages = pdfDoc.getPages();
  const singlePageFallback = pages.length === 1 ? pages[0] : undefined;

  for (const field of form.getFields()) {
    const hintedPageIndex = formDef.fieldPageHints?.[field.getName()];
    const hintedPage = hintedPageIndex !== undefined ? pages[hintedPageIndex] : singlePageFallback;

    for (const widget of field.acroField.getWidgets()) {
      const pageRef = widget.P();
      if (pageRef && pages.some((page) => page.ref === pageRef)) continue;

      const widgetRef = pdfDoc.context.getObjectRef(widget.dict);
      const resolvedPage = widgetRef ? pdfDoc.findPageForAnnotationRef(widgetRef) : undefined;
      const targetPage = resolvedPage ?? hintedPage;

      if (targetPage) {
        widget.dict.set(PDFName.of('P'), targetPage.ref);
      }
    }
  }
}

function getRemainingFieldCount(form: { getFields(): unknown[] }): number {
  return form.getFields().length;
}

/**
 * Remove orphaned Widget annotations that are not registered in the AcroForm field tree.
 * Some PDF templates contain Widget annotations directly in page Annots arrays
 * that pdf-lib's form.flatten() does not remove.
 */
function removeOrphanedWidgets(pdfDoc: PDFDocument): void {
  for (const page of pdfDoc.getPages()) {
    const annots = page.node.Annots();
    if (!annots) continue;

    for (let i = annots.size() - 1; i >= 0; i--) {
      const annotRef = annots.get(i);
      const annotDict =
        annotRef instanceof PDFRef
          ? pdfDoc.context.lookup(annotRef)
          : annotRef;
      if (!(annotDict instanceof PDFDict)) continue;

      const subtype = annotDict.get(PDFName.of('Subtype'));
      if (subtype === PDFName.of('Widget')) {
        annots.remove(i);
      }
    }

    if (annots.size() === 0) {
      page.node.delete(PDFName.of('Annots'));
    }
  }
}

/** Remove the AcroForm dictionary from the catalog to prevent viewers from showing form UI. */
function removeAcroForm(pdfDoc: PDFDocument): void {
  pdfDoc.catalog.delete(PDFName.of('AcroForm'));
}

function calcFitFontSize(
  text: string,
  font: PDFFont,
  field: {
    isMultiline(): boolean;
    acroField: {
      getDefaultAppearance(): string | undefined;
      getWidgets(): {
        getDefaultAppearance(): string | undefined;
        getRectangle(): { width: number; height: number };
        getBorderStyle?: () => { getWidth(): number } | undefined;
      }[];
    };
  },
): number {
  const widget = field.acroField.getWidgets()[0];
  if (!widget) return DEFAULT_MAX_FONT_SIZE;

  const borderWidth = widget.getBorderStyle?.()?.getWidth?.() ?? 0;
  const { width, height } = widget.getRectangle();
  const fieldWidth = clampFieldDimension(width - (borderWidth + FIELD_PADDING) * 2);
  const fieldHeight = clampFieldDimension(height - (borderWidth + FIELD_PADDING) * 2);
  const maxSize = getDefaultFontSize(widget.getDefaultAppearance())
    ?? getDefaultFontSize(field.acroField.getDefaultAppearance())
    ?? DEFAULT_MAX_FONT_SIZE;

  if (field.isMultiline()) {
    return calcMultilineFontSize(text, font, fieldWidth, fieldHeight, maxSize, DEFAULT_MIN_FONT_SIZE);
  }

  return calcSinglelineFontSize(text, font, fieldWidth, fieldHeight, maxSize, DEFAULT_MIN_FONT_SIZE);
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
      const manualOverride = caseData.manualFields?.[formScopedKey(formDef.id, mapping.field)];
      const rawValue = manualOverride || resolveSource(caseData, mapping.source);
      const value = applyTransform(rawValue, mapping.transform, mapping.digitIndex);
      if (!value) continue;

      const textField = form.getTextField(mapping.field);
      if (koreanFont) {
        const fontSize = calcFitFontSize(value, koreanFont, textField);
        textField.setFontSize(fontSize);
        setWidgetFontSize(textField, fontSize);
      }
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
      const checkbox = form.getCheckBox(mapping.field);
      if (mapping.condition(caseData)) {
        checkbox.check();
      }
      checkbox.defaultUpdateAppearances();
    } catch {
      // Skip missing fields
    }
  }

  // Mark all fields read-only to lock values
  for (const field of form.getFields()) {
    field.enableReadOnly();
  }

  form.acroForm.dict.set(PDFName.of('NeedAppearances'), PDFBool.False);

  repairWidgetPageRefs(pdfDoc, formDef, form);

  const canFlatten = canFlattenForm(pdfDoc, form);

  if (canFlatten) {
    form.flatten();
  }

  if (canFlatten) {
    removeOrphanedWidgets(pdfDoc);
    removeAcroForm(pdfDoc);
  }

  if (formDef.mustFlatten) {
    if (!canFlatten) {
      throw new Error(`Flatten required but widget/page mapping is incomplete for ${formDef.id}`);
    }

    if (getRemainingFieldCount(form) > 0) {
      throw new Error(`Flatten required but form fields remain for ${formDef.id}`);
    }
  }

  return pdfDoc.save();
}

export async function fillAndDownloadForm(formDef: FormDefinition, caseData: Case): Promise<void> {
  const pdfBytes = await fillFormPdf(formDef, caseData);

  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = formDef.buildFileName(caseData);
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
