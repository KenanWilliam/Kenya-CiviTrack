import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProjects, type Project } from "../features/projects/projectsApi";
import StatusPill from "../components/StatusPill";

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const q = params.get("q") ?? "";
  const status = (params.get("status") ?? "ALL").toUpperCase();
  const county = params.get("county") ?? "ALL";

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
        (p.description || "").toLowerCase().includes(term) ||
        (p.county || "").toLowerCase().includes(term);

      const matchStatus = status === "ALL" || (p.status || "").toUpperCase() === status;
      const matchCounty = county === "ALL" || (p.county || "") === county;

      return matchQ && matchStatus && matchCounty;
    });
  }, [items, q, status, county]);

  function setQ(v: string) {
    const next = new URLSearchParams(params);
    v ? next.set("q", v) : next.delete("q");
    setParams(next, { replace: true });
  }

  function setStatus(v: string) {
    const next = new URLSearchParams(params);
    v === "ALL" ? next.delete("status") : next.set("status", v);
    setParams(next, { replace: true });
  }

  function setCounty(v: string) {
    const next = new URLSearchParams(params);
    v === "ALL" ? next.delete("county") : next.set("county", v);
    setParams(next, { replace: true });
  }

  if (loading) return <div className="muted">Loading…</div>;
  if (err) return <div style={{ color: "crimson" }}>{err}</div>;

  return (
    <div>
      <h2 className="pageTitle">Explore</h2>
      <div className="muted" style={{ marginBottom: 12 }}>
        Browse publicly available project data. Sign in to comment/report.
      </div>

      <div className="card toolbar">
        <div className="field">
          <span className="muted">Search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="keywords, county…" />
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
              <option key={c} value={c}>{c === "ALL" ? "All" : c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="muted" style={{ marginBottom: 12 }}>
        Showing {filtered.length} of {items.length}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 14 }}>No matches.</div>
      ) : (
        <div className="grid">
          {filtered.map((p) => {
            const progress = Math.max(0, Math.min(100, Number(p.progress ?? 0)));
            return (
              <Link key={p.id} to={`/projects/${p.id}`} className="card projectCard col4">
                <div className="projectTop">
                  <div>
                    <h3 className="projectTitle">{p.title}</h3>
                    <div className="projectMeta">{p.county || "County not set"}</div>
                  </div>
                  <StatusPill status={p.status} />
                </div>

                <div className="progressWrap">
                  <div className="progressRow">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progressBar">
                    <div className="progressFill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
