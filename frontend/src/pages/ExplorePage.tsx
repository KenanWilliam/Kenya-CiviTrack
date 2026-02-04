import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchPulse, trackSearch, type PulseData } from "../features/analytics/analyticsApi";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusPill from "../components/StatusPill";

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * 100;
    const y = 30 - (v / max) * 30;
    return `${x},${y}`;
  });
  return (
    <svg viewBox="0 0 100 30" width="100%" height="30" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        points={points.join(" ")}
      />
    </svg>
  );
}

function MiniBars({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  return (
    <svg viewBox="0 0 100 40" width="100%" height="40" aria-hidden>
      {values.map((v, i) => {
        const width = 100 / values.length;
        const height = (v / max) * 40;
        return (
          <rect
            key={i}
            x={i * width + 2}
            y={40 - height}
            width={width - 4}
            height={height}
            rx="4"
            fill="currentColor"
            opacity="0.7"
          />
        );
      })}
    </svg>
  );
}

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
    if (term) trackSearch(term);
    nav(`/projects${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  }

  const spentPct = useMemo(() => {
    if (!pulse) return 0;
    if (pulse.total_spent == null || pulse.total_budget <= 0) return 0;
    return Math.min(100, (pulse.total_spent / pulse.total_budget) * 100);
  }, [pulse]);

  const trendingCounts = pulse?.trending_projects_7d.map((item) => item.count) ?? [];
  const searchCounts = pulse?.top_searches_7d.map((item) => item.count) ?? [];

  return (
    <div className="page">
      <div className="stack" style={{ gap: 18 }}>
        <div>
          <h2 className="sectionTitle">Explore • Pulse</h2>
          <p className="muted">
            Pulse shows internal trends from Kenya-CiviTrack. It’s your snapshot of what citizens are searching,
            viewing, and reporting this week.
          </p>
        </div>

        <Card className="stack reveal" style={{ padding: 18 }}>
          <form onSubmit={onSearch} className="heroSearch">
            <Input
              className="heroInput"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects, counties, keywords…"
              aria-label="Search projects"
            />
            <Button variant="primary" type="submit">Search Projects</Button>
          </form>
        </Card>

        {!pulse ? (
          <Card className="emptyState">Pulse data not available yet. Trigger some searches and open projects.</Card>
        ) : (
          <div className="grid gridTwo">
            <Card className="stack reveal" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>This week’s trending projects</strong>
                <Link className="btn btnGhost" to="/projects">Open list</Link>
              </div>
              <MiniBars values={trendingCounts} />
              <div className="stack">
                {pulse.trending_projects_7d.length === 0 ? (
                  <div className="muted">No views tracked in the last 7 days.</div>
                ) : (
                  pulse.trending_projects_7d.map((p) => (
                    <Link key={p.project_id} to={`/projects/${p.project_id}`} className="projectCardLink">
                      <div className="card projectCard">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <strong>{p.project__title}</strong>
                            <div className="projectMeta">{p.project__county || "County not set"}</div>
                          </div>
                          <StatusPill status={p.project__status} />
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>{p.count} views</div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </Card>

            <div className="stack">
              <Card className="stack reveal revealDelay1" style={{ padding: 18 }}>
                <strong>Top searches (7 days)</strong>
                <Sparkline values={searchCounts} />
                <div className="stack">
                  {pulse.top_searches_7d.length === 0 ? (
                    <div className="muted">No searches yet.</div>
                  ) : (
                    pulse.top_searches_7d.map((s) => (
                      <div key={s.query} className="card projectCard">
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>{s.query}</strong>
                          <span className="muted">{s.count}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="stack reveal revealDelay2" style={{ padding: 18 }}>
                <strong>Budget usage (overall)</strong>
                <div className="muted">Allocated: {pulse.total_budget.toLocaleString()}</div>
                {pulse.total_spent == null ? (
                  <div className="muted">Spent tracking will appear once reported.</div>
                ) : (
                  <>
                    <div className="muted">Spent: {pulse.total_spent.toLocaleString()}</div>
                    <div className="progressBar">
                      <div className="progressFill" style={{ width: `${spentPct}%` }} />
                    </div>
                  </>
                )}
              </Card>
            </div>

            <Card className="stack reveal" style={{ padding: 18 }}>
              <strong>Public buzz (coming soon)</strong>
              <p className="muted">
                We’ll connect to public social APIs once credentials and policies are ready. Expect sentiment
                snapshots, top mentions, and cross-platform highlights.
              </p>
              <div className="grid gridAuto">
                <div className="card projectCard">
                  <div className="muted">Source</div>
                  <strong>X / Twitter</strong>
                  <div className="muted">Awaiting API access</div>
                </div>
                <div className="card projectCard">
                  <div className="muted">Source</div>
                  <strong>Reddit</strong>
                  <div className="muted">Placeholder module</div>
                </div>
                <div className="card projectCard">
                  <div className="muted">Source</div>
                  <strong>News</strong>
                  <div className="muted">Integrate RSS feeds</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
