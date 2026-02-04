import { apiFetch } from "../../api/http";

export type Report = {
  id: number;
  project?: number;
  category: string;
  description: string;
  status: string;
  created_at: string;
  updated_at?: string;
  user_username?: string;
  user_role?: string;
};

export async function fetchReports(projectId: number | string): Promise<Report[]> {
  return apiFetch(`/api/projects/${projectId}/reports/`);
}

export async function createReport(
  projectId: number | string,
  payload: { category: string; description: string }
): Promise<Report> {
  return apiFetch(`/api/projects/${projectId}/reports/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateReportStatus(reportId: number, status: string): Promise<Report> {
  return apiFetch(`/api/reports/${reportId}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function fetchAllReports(): Promise<Report[]> {
  return apiFetch(`/api/reports/`);
}
