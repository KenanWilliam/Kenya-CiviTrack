import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { useAuth } from "../features/auth/authContext";
import { fetchAllReports, updateReportStatus, type Report } from "../features/reports/reportsApi";

export default function AdminPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const isStaff = user?.role === "ADMIN" || user?.role === "OFFICIAL";

  useEffect(() => {
    (async () => {
      if (!isStaff) {
        setLoading(false);
        return;
      }
      try {
        setErr(null);
        setLoading(true);
        const data = await fetchAllReports();
        setReports(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load reports");
      } finally {
        setLoading(false);
      }
    })();
  }, [isStaff]);

  async function handleStatusChange(reportId: number, status: string) {
    try {
      await updateReportStatus(reportId, status);
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
    } catch (e: any) {
      setErr(e?.message ?? "Failed to update status");
    }
  }

  if (!isStaff) {
    return <Card className="emptyState">You don’t have permission to view admin reports.</Card>;
  }

  return (
    <div className="page stack">
      <div>
        <h2 className="sectionTitle">Admin • Moderation</h2>
        <p className="muted">Review citizen reports and update their status.</p>
      </div>

      {err ? <div className="errorCard">{err}</div> : null}

      {loading ? (
        <Card className="emptyState">Loading reports…</Card>
      ) : reports.length === 0 ? (
        <Card className="emptyState">No reports yet.</Card>
      ) : (
        <div className="stack">
          {reports.map((r) => (
            <Card key={r.id} className="projectCard">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <strong>{r.category}</strong>
                  <div className="muted">Project #{r.project ?? "—"}</div>
                </div>
                <span className="badge">{r.status}</span>
              </div>
              <div className="muted" style={{ whiteSpace: "pre-wrap" }}>{r.description}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                Filed by {r.user_username || "Citizen"} • {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
              </div>
              <div className="inlineList">
                <select
                  className="select"
                  value={r.status}
                  onChange={(e) => handleStatusChange(r.id, e.target.value)}
                  aria-label="Update report status"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_REVIEW">In review</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
