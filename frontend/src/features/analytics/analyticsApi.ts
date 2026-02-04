import { apiFetch } from "../../api/http";

export async function trackSearch(query: string) {
  try {
    await apiFetch("/api/analytics/search/", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  } catch {}
}

export async function trackProjectView(project_id: number) {
  try {
    await apiFetch("/api/analytics/project-view/", {
      method: "POST",
      body: JSON.stringify({ project_id }),
    });
  } catch {}
}

export type PulseData = {
  total_projects: number;
  status_counts: { status: string; count: number }[];
  top_searches: { query: string; count: number }[];
  top_viewed: { project_id: number; project__title: string; project__status: string | null; project__county: string | null; count: number }[];
  top_searches_7d: { query: string; count: number }[];
  trending_projects_7d: { project_id: number; project__title: string; project__status: string | null; project__county: string | null; count: number }[];
  recent_searches: { query: string; created_at: string }[];
  recent_views: { project_id: number; project__title: string; created_at: string }[];
  total_budget: number;
  total_spent: number | null;
};

export async function fetchPulse(): Promise<PulseData> {
  return apiFetch("/api/pulse/");
}
