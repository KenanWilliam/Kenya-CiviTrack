import { apiFetch } from "../../api/http";

export type Comment = {
  id: number;
  body: string;
  created_at: string;
  user_username?: string;
  user_role?: string;
};

export async function fetchComments(projectId: number | string): Promise<Comment[]> {
  return apiFetch(`/api/projects/${projectId}/comments/`);
}

export async function createComment(projectId: number | string, body: string): Promise<Comment> {
  return apiFetch(`/api/projects/${projectId}/comments/`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
