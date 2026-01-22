import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProject, type Project } from "../features/projects/projectsApi";
import StatusPill from "../components/StatusPill";
import { isLoggedIn } from "../features/auth/tokens";

export default function ProjectDetails() {
  const { id } = useParams();
  const [item, setItem] = useState<Project | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        if (!id) return;
        const data = await fetchProject(id);
        setItem(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load project");
      }
    })();
  }, [id]);

  if (err) return <div style={{ color: "crimson" }}>{err}</div>;
  if (!item) return <div className="muted">Loading…</div>;

  const progress = Math.max(0, Math.min(100, Number(item.progress ?? 0)));

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link className="muted" to="/explore">← Back to explore</Link>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="projectTop">
          <div>
            <h2 className="pageTitle" style={{ marginBottom: 6 }}>{item.title}</h2>
            <div className="muted">
              {item.county || "County not set"}
              {item.budget ? ` • Budget: ${item.budget}` : ""}
            </div>
          </div>
          <StatusPill status={item.status} />
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

        <div style={{ marginTop: 14, lineHeight: 1.6 }}>
          <strong>Description</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            {item.description || "No description provided."}
          </div>
        </div>

        <div className="grid" style={{ marginTop: 14 }}>
          <div className="card col6" style={{ padding: 12 }}>
            <strong>Timeline</strong>
            <div className="muted" style={{ marginTop: 6 }}>
              Start: {item.start_date || "—"}<br />
              End: {item.end_date || "—"}
            </div>
          </div>
          <div className="card col6" style={{ padding: 12 }}>
            <strong>Location</strong>
            <div className="muted" style={{ marginTop: 6 }}>
              Lat: {item.latitude ?? "—"}<br />
              Lng: {item.longitude ?? "—"}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {!isLoggedIn() ? (
            <>
              <Link className="btn btnPrimary" to="/login">Sign in to comment/report</Link>
              <Link className="btn" to="/signup">Create an account</Link>
            </>
          ) : (
            <div className="muted">
              Next: we’ll add Comment + Report buttons here (auth-only).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
