import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProjects, type Project } from "../features/projects/projectsApi";
import { trackSearch } from "../features/analytics/analyticsApi";
import { useAuth } from "../features/auth/authContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusPill from "../components/StatusPill";

export default function LandingPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<Project[]>([]);
  const [q, setQ] = useState("");
  const authed = !!user;

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
    if (term) trackSearch(term);
    nav(`/projects${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  }

  return (
    <div className="page">
      <Card className="hero reveal">
        <div>
          <span className="badge">Public transparency for Kenya</span>
          <h1 className="heroTitle">Kenya-CiviTrack</h1>
          <p className="heroText">
            Explore public infrastructure projects, track progress, and verify updates. Browse freely. Creating
            reports and comments requires an account.
          </p>

          <form onSubmit={onSearch} className="heroSearch">
            <Input
              className="heroInput"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects by title, county, keywords…"
              aria-label="Search projects"
            />
            <Button variant="primary" type="submit">Search</Button>
          </form>

          <div className="heroActions">
            <Link className="btn btnGhost" to="/explore">Explore Pulse</Link>
            {authed ? (
              <>
                <Link className="btn btnPrimary" to="/projects">Go to Projects</Link>
                <Link className="btn btnGhost" to="/map">Open Map</Link>
              </>
            ) : (
              <>
                <Link className="btn btnPrimary" to="/login">Sign in</Link>
                <Link className="btn btnGhost" to="/signup">Create account</Link>
                <Link className="btn btnGhost" to="/projects">Browse all projects</Link>
              </>
            )}
          </div>
        </div>

        <div className="heroStats">
          <Card variant="soft" className="kpi">
            <div className="muted">Total projects</div>
            <div className="kpiValue">{counts.total}</div>
          </Card>
          <Card variant="soft" className="kpi">
            <div className="muted">Ongoing</div>
            <div className="kpiValue">{counts.ongoing}</div>
          </Card>
          <Card variant="soft" className="kpi">
            <div className="muted">Completed</div>
            <div className="kpiValue">{counts.completed}</div>
          </Card>
        </div>
      </Card>

      <div style={{ height: 18 }} />

      <div className="grid gridTwo">
        <Card className="stack reveal revealDelay1" style={{ padding: 18 }}>
          <h3 style={{ margin: 0 }}>Why CiviTrack?</h3>
          <p className="muted">
            A public accountability layer for Kenya’s infrastructure projects. Track budgets, progress, and the
            latest reports from citizens and officials.
          </p>
          <div className="inlineList">
            <span className="badge">Transparency</span>
            <span className="badge">Public verification</span>
            <span className="badge">Actionable reports</span>
          </div>
        </Card>

        <Card className="stack reveal revealDelay2" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Top ongoing</h3>
            <Link className="btn btnGhost" to="/projects?status=ONGOING">See all</Link>
          </div>
          {ongoingTop.length === 0 ? (
            <div className="muted">No ongoing projects yet.</div>
          ) : (
            <div className="stack">
              {ongoingTop.map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="projectCardLink">
                  <div className="card projectCard">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <strong>{p.title}</strong>
                        <div className="projectMeta">
                          {p.county || "County not set"} • {Math.max(0, Math.min(100, Number(p.progress ?? 0)))}%
                        </div>
                      </div>
                      <StatusPill status={p.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
