import { api } from './api';

export interface GenerateReasonResult {
  er_reason: string;
  er_tech_effect: string;
  er_utilization_plan: string;
  er_other: string;
}

export async function generateEmploymentReason(caseId: string) {
  return api<GenerateReasonResult>(`/api/cases/${caseId}/generate-reason`, {
    method: 'POST',
  });
}
