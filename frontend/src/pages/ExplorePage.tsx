import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchPulse, trackSearch, type PulseData } from "../features/analytics/analyticsApi";

export default function ExplorePage() {
  const nav = useNavigate();
  const [pulse, setPulse] = useState<PulseData | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setPulse(await fetchPulse());
      } catch {
        setPulse(null);
      }
    })();
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    trackSearch(term);
    nav(`/projects${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  }

  const spentPct = useMemo(() => {
    if (!pulse) return 0;
    if (pulse.total_spent == null || pulse.total_budget <= 0) return 0;
    return Math.min(100, (pulse.total_spent / pulse.total_budget) * 100);
  }, [pulse]);

  return (
    <div>
      <h2 className="pageTitle">Explore • Pulse</h2>
      <div className="muted" style={{ marginBottom: 12 }}>
        This page shows trends inside Kenya-CiviTrack (searches + views). External social feeds can be added later via official APIs.
      </div>

      <div className="card toolbar">
        <form onSubmit={onSearch} style={{ display: "flex", gap: 10, flexWrap: "wrap", width: "100%" }}>
          <div className="field" style={{ flex: 1, minWidth: 240 }}>
            <span className="muted">Quick search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try: Nairobi road, water, Turkana…"
            />
          </div>
          <button className="btn btnPrimary" type="submit">Search Projects</button>
        </form>
      </div>

      {!pulse ? (
        <div className="card" style={{ padding: 14 }}>
          <div className="muted">Pulse data not available yet. Trigger some searches and open a few project details, then refresh.</div>
        </div>
      ) : (
        <>
          <div className="grid" style={{ marginTop: 12 }}>
            <div className="card col4" style={{ padding: 14 }}>
              <div className="muted">Total projects</div>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>{pulse.total_projects}</div>
            </div>

            <div className="card col4" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Status breakdown</strong>
                <Link className="muted" to="/projects">Open list</Link>
              </div>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {pulse.status_counts.slice(0, 5).map((s) => (
                  <div key={s.status} className="miniRow">
                    <div style={{ fontWeight: 800 }}>{(s.status || "UNKNOWN").toUpperCase()}</div>
                    <span className="muted">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card col4" style={{ padding: 14 }}>
              <strong>Budget usage</strong>
              <div className="muted" style={{ marginTop: 6 }}>
                Allocated total: {pulse.total_budget.toLocaleString()}
              </div>
              {pulse.total_spent == null ? (
                <div className="muted" style={{ marginTop: 8 }}>
                  Spent tracking will appear after Step 3.
                </div>
              ) : (
                <>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Spent: {pulse.total_spent.toLocaleString()}
                  </div>
                  <div className="progressBar" style={{ marginTop: 10 }}>
                    <div className="progressFill" style={{ width: `${spentPct}%` }} />
                  </div>
                </>
              )}
            </div>

            <div className="card col6" style={{ padding: 14 }}>
              <strong>Trending searches</strong>
              <div className="muted" style={{ marginTop: 6 }}>What people are looking up inside the app</div>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {pulse.top_searches.length === 0 ? (
                  <div className="muted">No searches tracked yet.</div>
                ) : (
                  pulse.top_searches.slice(0, 8).map((s) => (
                    <div key={s.query} className="miniRow">
                      <div style={{ fontWeight: 800 }}>{s.query}</div>
                      <span className="muted">{s.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card col6" style={{ padding: 14 }}>
              <strong>Most viewed projects</strong>
              <div className="muted" style={{ marginTop: 6 }}>What’s getting attention</div>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {pulse.top_viewed.length === 0 ? (
                  <div className="muted">No project views tracked yet.</div>
                ) : (
                  pulse.top_viewed.slice(0, 8).map((p) => (
                    <Link key={p.project_id} to={`/projects/${p.project_id}`} className="miniRow">
                      <div>
                        <div style={{ fontWeight: 900 }}>{p.project__title}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {p.project__county || "—"} • {(p.project__status || "").toUpperCase()}
                        </div>
                      </div>
                      <span className="muted">{p.count} views</span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="card col12" style={{ padding: 14 }}>
              <strong>Recent activity</strong>
              <div className="muted" style={{ marginTop: 6 }}>Latest searches + project opens (internal pulse)</div>

              <div className="grid" style={{ marginTop: 10 }}>
                <div className="col6">
                  <div className="muted" style={{ marginBottom: 8 }}>Recent searches</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {pulse.recent_searches.map((s, idx) => (
                      <div key={idx} className="miniRow">
                        <div style={{ fontWeight: 800 }}>{s.query || "—"}</div>
                        <span className="muted">search</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col6">
                  <div className="muted" style={{ marginBottom: 8 }}>Recent project opens</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {pulse.recent_views.map((v, idx) => (
                      <Link key={idx} to={`/projects/${v.project_id}`} className="miniRow">
                        <div style={{ fontWeight: 900 }}>{v.project__title}</div>
                        <span className="muted">view</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="muted" style={{ marginTop: 12 }}>
                External “social mentions” can be integrated later (X/Reddit APIs) once credentials/policies are set.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
