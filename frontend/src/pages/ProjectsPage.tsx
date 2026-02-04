import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProjects, type Project } from "../features/projects/projectsApi";
import StatusPill from "../components/StatusPill";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Skeleton from "../components/ui/Skeleton";
import useDebounce from "../hooks/useDebounce";

export default function ProjectsPage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Project[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [status, setStatus] = useState(() => (searchParams.get("status") ?? "ALL").toUpperCase());
  const [county, setCounty] = useState(() => searchParams.get("county") ?? "ALL");

  const debouncedQ = useDebounce(q, 300);

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

  useEffect(() => {
    const nextQ = searchParams.get("q") ?? "";
    const nextStatus = (searchParams.get("status") ?? "ALL").toUpperCase();
    const nextCounty = searchParams.get("county") ?? "ALL";
    setQ(nextQ);
    setStatus(nextStatus);
    setCounty(nextCounty);
  }, [searchParams]);

  const counties = useMemo(() => {
    const set = new Set<string>();
    for (const p of items) if (p.county) set.add(p.county);
    return ["ALL", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    return items.filter((p) => {
      const matchQ =
        !term ||
        (p.title || "").toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term);

      const matchStatus = status === "ALL" || (p.status || "").toUpperCase() === status;
      const matchCounty = county === "ALL" || (p.county || "") === county;

      return matchQ && matchStatus && matchCounty;
    });
  }, [items, debouncedQ, status, county]);

  return (
    <div className="page">
      <h2 className="sectionTitle">Projects</h2>
      <p className="muted">Showing {filtered.length} of {items.length}</p>

      <Card className="stack" style={{ padding: 18 }}>
        <div className="grid gridAuto">
          <Input
            label="Keyword"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or description"
          />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All</option>
            <option value="PLANNED">Planned</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="STALLED">Stalled</option>
          </Select>
          <Select label="County" value={county} onChange={(e) => setCounty(e.target.value)}>
            {counties.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "All" : c}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div style={{ height: 16 }} />

      {loading ? (
        <div className="grid gridAuto">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="projectCard">
              <Skeleton height={16} width="60%" />
              <Skeleton height={12} width="40%" style={{ marginTop: 10 }} />
              <Skeleton height={10} width="100%" style={{ marginTop: 18 }} />
              <Skeleton height={10} width="90%" style={{ marginTop: 8 }} />
            </Card>
          ))}
        </div>
      ) : err ? (
        <div className="errorCard">{err}</div>
      ) : filtered.length === 0 ? (
        <Card className="emptyState">No projects match your filters.</Card>
      ) : (
        <div className="grid gridAuto">
          {filtered.map((p) => {
            const progress = Math.max(0, Math.min(100, Number(p.progress ?? 0)));
            return (
              <Link key={p.id} to={`/projects/${p.id}`} className="projectCardLink">
                <Card className="projectCard">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{p.title}</h3>
                      <div className="projectMeta">
                        {p.county ? p.county : "County not set"}
                        {p.budget ? ` • Budget: ${p.budget}` : ""}
                      </div>
                    </div>
                    <StatusPill status={p.status} />
                  </div>

                  <div className="muted" style={{ fontSize: 13 }}>
                    {p.description ? p.description : "No description."}
                  </div>

                  <div className="stack" style={{ gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progressBar">
                      <div className="progressFill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
