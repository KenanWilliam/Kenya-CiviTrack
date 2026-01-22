import { useEffect, useState } from "react";
import { fetchProjects, type Project } from "../features/projects/projectsApi.ts";

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const data = await fetchProjects();
        setItems(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading projects…</div>;
  if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Projects</h2>
      {items.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {items.map((p) => (
            <li key={p.id}>
              <strong>{p.title}</strong> — {p.status} — {p.progress}%
              {p.county ? ` (${p.county})` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
