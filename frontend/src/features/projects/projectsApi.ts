import { apiFetch } from "../../api/http";

export type Project = {
  id: number;
  title: string;
  description?: string;
  county?: string;
  status: string;
  budget?: string | null;
  spent_amount?: string | null;
  progress: number;
  latitude?: string | null;
  longitude?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchProjects(): Promise<Project[]> {
  return apiFetch("/api/projects/");
}

export async function fetchProject(id: string | number): Promise<Project> {
  return apiFetch(`/api/projects/${id}/`);
}
