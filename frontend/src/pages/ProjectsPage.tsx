import { useEffect, useMemo, useState } from "react";
import { fetchProjects, type Project } from "../features/projects/projectsApi";
import StatusPill from "../components/StatusPill";

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [county, setCounty] = useState("ALL");

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await fetchProjects();
        setItems(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counties = useMemo(() => {
    const set = new Set<string>();
    for (const p of items) if (p.county) set.add(p.county);
    return ["ALL", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((p) => {
      const matchQ =
        !term ||
        (p.title || "").toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term);

      const matchStatus = status === "ALL" || (p.status || "").toUpperCase() === status;
      const matchCounty = county === "ALL" || (p.county || "") === county;

      return matchQ && matchStatus && matchCounty;
    });
  }, [items, q, status, county]);

  if (loading) return <div className="muted">Loading projects…</div>;
  if (err) return <div style={{ color: "crimson" }}>{err}</div>;

  return (
    <div>
      <h2 className="pageTitle">Projects</h2>
      <div className="muted" style={{ marginBottom: 12 }}>
        Showing {filtered.length} of {items.length}
      </div>

      <div className="card toolbar">
        <div className="field">
          <span className="muted">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="title or description…"
          />
        </div>

        <div className="field">
          <span className="muted">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All</option>
            <option value="PLANNED">Planned</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="STALLED">Stalled</option>
          </select>
        </div>

        <div className="field">
          <span className="muted">County</span>
          <select value={county} onChange={(e) => setCounty(e.target.value)}>
            {counties.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "All" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 14 }}>
          No projects match your filters.
        </div>
      ) : (
        <div className="grid">
          {filtered.map((p) => {
            const progress = Math.max(0, Math.min(100, Number(p.progress ?? 0)));
            return (
              <div key={p.id} className="card projectCard col4">
                <div className="projectTop">
                  <div>
                    <h3 className="projectTitle">{p.title}</h3>
                    <div className="projectMeta">
                      {p.county ? p.county : "County not set"}
                      {p.budget ? ` • Budget: ${p.budget}` : ""}
                    </div>
                  </div>
                  <StatusPill status={p.status} />
                </div>

                {p.description ? (
                  <div className="muted" style={{ marginTop: 10, fontSize: 13, lineHeight: 1.4 }}>
                    {p.description}
                  </div>
                ) : (
                  <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                    No description.
                  </div>
                )}

                <div className="progressWrap">
                  <div className="progressRow">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progressBar">
                    <div className="progressFill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
