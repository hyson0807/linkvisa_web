export type DocumentCategory = 'foreigner' | 'company' | 'generated';
export type DocumentSource = 'upload' | 'ocr' | 'ai-generate' | 'form-generate';
export type DocumentStatus = 'pending' | 'uploaded' | 'ocr-processing' | 'ocr-complete' | 'ai-generating' | 'complete' | 'error';
export type CaseStatus = 'draft' | 'documents-pending' | 'ocr-in-progress' | 'generation-ready' | 'complete';

export type ApplicationType =
  | '외국인등록'
  | '등록증재발급'
  | '체류기간연장허가'
  | '체류자격변경허가'
  | '체류자격부여'
  | '근무처변경추가'
  | '체류지변경신고'
  | '등록사항변경신고';

export interface DocumentTypeDef {
  id: string;
  label: string;
  category: DocumentCategory;
  source: DocumentSource;
  step: 'upload' | 'ocr' | 'generate' | 'output';
  ocrFields?: string[];
  requiredForVisas: string[];
}

export interface FileHandle {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface CaseDocument {
  id: string;
  typeId: string;
  status: DocumentStatus;
  files?: FileHandle[];
  ocrResult?: Record<string, string>;
  aiContent?: string;
  isCustom?: boolean;
  customLabel?: string;
  customCategory?: string;
}

export interface ManualFieldDef {
  id: string;
  label: string;
  section: 'unified_app' | 'employment_reason' | 'guarantor' | 'residence' | 'other';
  fieldType: 'text' | 'date' | 'select' | 'textarea' | 'radio';
  options?: { value: string; label: string }[];
  defaultValue?: string;
  required: boolean;
  requiredForVisas: string[];
  placeholder?: string;
  halfWidth?: boolean;
}

export interface StudentSubmission {
  submittedAt: string;
  fields: Record<string, string>;
}

export interface ShareLinkInfo {
  token: string;
  expiresAt: string;
  isActive: boolean;
}

export interface Case {
  id: string;
  foreignerName: string;
  companyName: string;
  visaType: string;
  applicationType?: ApplicationType;
  status: CaseStatus;
  documents: CaseDocument[];
  manualFields: Record<string, string>;
  customDocTypes?: DocumentTypeDef[];
  studentLinkToken?: string;
  studentSubmission?: StudentSubmission;
  shareLinks?: Record<string, ShareLinkInfo>;
  createdAt: string;
}

export type DocWithType = { caseDoc: CaseDocument; docType: DocumentTypeDef };

export function hasFiles(doc: CaseDocument): boolean {
  return !!(doc.files && doc.files.length > 0);
}

export function latestFile(doc: CaseDocument): FileHandle | undefined {
  return doc.files?.[doc.files.length - 1];
}
