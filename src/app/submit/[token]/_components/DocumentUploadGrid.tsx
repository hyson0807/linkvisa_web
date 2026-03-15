'use client';

import DocumentUploadCard from './DocumentUploadCard';
import type { FileInfo } from './DocumentUploadCard';

interface DocumentItem {
  id: string;
  label: string;
  existingFile?: FileInfo;
}

interface DocumentUploadGridProps {
  documents: DocumentItem[];
  onUpload: (docId: string, file: File) => Promise<void>;
}

export default function DocumentUploadGrid({
  documents,
  onUpload,
}: DocumentUploadGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {documents.map((doc) => (
        <DocumentUploadCard
          key={doc.id}
          docId={doc.id}
          label={doc.label}
          existingFile={doc.existingFile}
          onUpload={onUpload}
        />
      ))}
    </div>
  );
}
