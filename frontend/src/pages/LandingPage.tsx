import { isLoggedIn } from "../features/auth/tokens";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProjects, type Project } from "../features/projects/projectsApi";
import StatusPill from "../components/StatusPill";
import { trackSearch } from "../features/analytics/analyticsApi";


export default function LandingPage() {
  const nav = useNavigate();
  const [items, setItems] = useState<Project[]>([]);
  const [q, setQ] = useState("");
  const authed = isLoggedIn();


  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProjects();
        setItems(data);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  const ongoingTop = useMemo(() => {
    const ongoing = items.filter((p) => (p.status || "").toUpperCase() === "ONGOING");
    return ongoing.slice(0, 6);
  }, [items]);

  const counts = useMemo(() => {
    const total = items.length;
    const ongoing = items.filter((p) => (p.status || "").toUpperCase() === "ONGOING").length;
    const completed = items.filter((p) => (p.status || "").toUpperCase() === "COMPLETED").length;
    return { total, ongoing, completed };
  }, [items]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();

    // ✅ track landing-page searches (only if not empty)
    if (term) trackSearch(term);

    nav(`/explore${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  }

  return (
    <div>
      <div className="hero card">
        <div className="heroLeft">
          <h1 className="heroTitle">Kenya-CiviTrack</h1>
          <p className="heroText">
            Explore public projects, track progress, and verify updates. Anyone can browse.
            Creating reports and comments requires an account.
          </p>

          <form onSubmit={onSearch} className="heroSearch">
            <input
              className="heroInput"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects by title, county, keywords…"
            />
            <button className="btn btnPrimary" type="submit">Search</button>
          </form>

          <div className="heroLinks">
          <Link className="btn" to="/explore">Explore</Link>

          {authed ? (
            <>
              <Link className="btn btnPrimary" to="/projects">Go to Projects</Link>
              <Link className="btn" to="/map">Open Map</Link>
            </>
          ) : (
            <>
              <Link className="btn btnPrimary" to="/login">Sign in</Link>
              <Link className="btn" to="/signup">Create account</Link>
              <Link className="btn" to="/projects">Browse all projects</Link>
            </>
          )}
        </div>
        </div>

        <div className="heroRight">
          <div className="kpiGrid">
            <div className="kpi card">
              <div className="kpiLabel">Total projects</div>
              <div className="kpiValue">{counts.total}</div>
            </div>
            <div className="kpi card">
              <div className="kpiLabel">Ongoing</div>
              <div className="kpiValue">{counts.ongoing}</div>
            </div>
            <div className="kpi card">
              <div className="kpiLabel">Completed</div>
              <div className="kpiValue">{counts.completed}</div>
            </div>
          </div>

          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <strong>Top ongoing</strong>
              <Link className="muted" to="/explore?status=ONGOING">See all</Link>
            </div>

            {ongoingTop.length === 0 ? (
              <div className="muted">No ongoing projects yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {ongoingTop.map((p) => (
                  <Link key={p.id} to={`/projects/${p.id}`} className="miniRow">
                    <div>
                      <div style={{ fontWeight: 700 }}>{p.title}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {p.county || "County not set"} • {Math.max(0, Math.min(100, Number(p.progress ?? 0)))}%
                      </div>
                    </div>
                    <StatusPill status={p.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
