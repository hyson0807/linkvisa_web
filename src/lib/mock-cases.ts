import type { Case } from '@/types/case';

export const mockCases: Case[] = [
  {
    id: 'case-001',
    foreignerName: 'John Smith',
    companyName: '(주)테크코리아',
    visaType: 'E-7',
    applicationType: '체류기간연장허가',
    status: 'ocr-in-progress',
    documents: [
      { id: 'doc-001', typeId: 'passport', status: 'ocr-complete' },
      { id: 'doc-002', typeId: 'alien-card', status: 'ocr-processing' },
    ],
    manualFields: {},
    createdAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'case-002',
    foreignerName: 'Nguyen Thi Mai',
    companyName: '삼성전자(주)',
    visaType: 'E-9',
    applicationType: '근무처변경추가',
    status: 'documents-pending',
    documents: [
      { id: 'doc-003', typeId: 'passport', status: 'uploaded' },
    ],
    manualFields: {},
    createdAt: '2026-03-09T14:30:00Z',
  },
  {
    id: 'case-003',
    foreignerName: 'Wang Wei',
    companyName: '현대건설(주)',
    visaType: 'D-2',
    applicationType: '체류자격변경허가',
    status: 'complete',
    documents: [
      { id: 'doc-004', typeId: 'passport', status: 'complete' },
      { id: 'doc-005', typeId: 'alien-card', status: 'complete' },
      { id: 'doc-006', typeId: 'unified-application', status: 'complete' },
    ],
    manualFields: { purpose: '학위과정 변경' },
    createdAt: '2026-03-05T11:00:00Z',
  },
];
