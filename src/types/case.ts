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
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface CaseDocument {
  id: string;
  typeId: string;
  status: DocumentStatus;
  file?: FileHandle;
  ocrResult?: Record<string, string>;
  aiContent?: string;
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
  createdAt: string;
}

export type DocWithType = { caseDoc: CaseDocument; docType: DocumentTypeDef };
