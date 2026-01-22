import { apiFetch } from "../../api/http";

export type Project = {
  id: number;
  title: string;
  description?: string;
  county?: string;
  status: string;
  budget?: string | null;
  progress: number;
  latitude?: string | null;
  longitude?: string | null;
};

export async function fetchProjects(): Promise<Project[]> {
  return apiFetch("/api/projects/");
}
