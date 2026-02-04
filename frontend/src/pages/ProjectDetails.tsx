import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProject, type Project } from "../features/projects/projectsApi";
import StatusPill from "../components/StatusPill";
import { trackProjectView } from "../features/analytics/analyticsApi";
import { useAuth } from "../features/auth/authContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Tabs from "../components/ui/Tabs";
import Modal from "../components/ui/Modal";
import { createComment, fetchComments, type Comment } from "../features/comments/commentsApi";
import { createReport, fetchReports, type Report } from "../features/reports/reportsApi";

export default function ProjectDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<Project | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [socialLoading, setSocialLoading] = useState(true);
  const [socialErr, setSocialErr] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);

  const [commentModal, setCommentModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [reportCategory, setReportCategory] = useState("DELAY");
  const [reportBody, setReportBody] = useState("");

  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        if (!id) return;
        const data = await fetchProject(id);
        setItem(data);

        if (id && trackedRef.current !== id) {
          trackedRef.current = id;
          trackProjectView(Number(id));
        }
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load project");
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setSocialErr(null);
        setSocialLoading(true);
        const [c, r] = await Promise.all([fetchComments(id), fetchReports(id)]);
        setComments(c);
        setReports(r);
      } catch (e: any) {
        setSocialErr(e?.message ?? "Failed to load community activity");
      } finally {
        setSocialLoading(false);
      }
    })();
  }, [id]);

  async function submitComment() {
    if (!id || !commentBody.trim()) return;
    try {
      setActionErr(null);
      await createComment(id, commentBody.trim());
      setCommentBody("");
      setCommentModal(false);
      const data = await fetchComments(id);
      setComments(data);
    } catch (e: any) {
      setActionErr(e?.message ?? "Failed to submit comment");
    }
  }

  async function submitReport() {
    if (!id || !reportBody.trim()) return;
    try {
      setActionErr(null);
      await createReport(id, { category: reportCategory, description: reportBody.trim() });
      setReportBody("");
      setReportModal(false);
      const data = await fetchReports(id);
      setReports(data);
    } catch (e: any) {
      setActionErr(e?.message ?? "Failed to submit report");
    }
  }

  const progress = Math.max(0, Math.min(100, Number(item?.progress ?? 0)));
  const rawBudget = item?.budget;
  const budget = rawBudget === null || rawBudget === undefined ? null : Number(rawBudget);
  const rawSpent = (item as any)?.spent_amount;
  const spentAmount = rawSpent === null || rawSpent === undefined ? null : Number(rawSpent);
  const spentPct = useMemo(() => {
    if (!budget || spentAmount == null) return 0;
    return Math.min(100, (spentAmount / budget) * 100);
  }, [budget, spentAmount]);

  function handleBack() {
    if (window.history.length > 1) nav(-1);
    else nav("/projects");
  }

  if (err) return <div className="errorCard">{err}</div>;
  if (!item) return <div className="muted">Loading…</div>;

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="stack">
          <Card className="stack" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0 }}>{item.title}</h2>
                <div className="projectMeta">
                  {item.county || "County not set"}
                  {item.budget ? ` • Budget: ${item.budget}` : ""}
                </div>
              </div>
              <StatusPill status={item.status} />
            </div>

            <div className="stack" style={{ gap: 8 }}>
              <div className="muted" style={{ lineHeight: 1.6 }}>
                {item.description || "No description provided."}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="progressBar">
                  <div className="progressFill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gridTwo">
            <Card className="stack" style={{ padding: 16 }}>
              <strong>Timeline</strong>
              <div className="muted">Start: {item.start_date || "—"}</div>
              <div className="muted">End: {item.end_date || "—"}</div>
            </Card>
            <Card className="stack" style={{ padding: 16 }}>
              <strong>Location</strong>
              <div className="muted">Lat: {item.latitude ?? "—"}</div>
              <div className="muted">Lng: {item.longitude ?? "—"}</div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "budget",
      label: "Budget",
      content: (
        <div className="stack">
          <Card className="stack" style={{ padding: 18 }}>
            <strong>Budget overview</strong>
            <div className="muted">Allocated: {item.budget ?? "Not reported"}</div>
            {spentAmount == null ? (
              <div className="muted">Spent tracking not available yet.</div>
            ) : (
              <>
                <div className="muted">Spent: {spentAmount.toLocaleString()}</div>
                <div className="progressBar">
                  <div className="progressFill" style={{ width: `${spentPct}%` }} />
                </div>
              </>
            )}
          </Card>
          <Card className="stack" style={{ padding: 18 }}>
            <strong>What we’ll add next</strong>
            <div className="muted">Breakdowns by contractor, phase, and verified invoices.</div>
          </Card>
        </div>
      ),
    },
    {
      id: "community",
      label: "Community",
      content: (
        <div className="stack">
          {!user ? (
            <Card className="stack" style={{ padding: 18 }}>
              <strong>Join the conversation</strong>
              <p className="muted">Sign in to add comments or file an issue report.</p>
              <div className="inlineList">
                <Link className="btn btnPrimary" to={`/login?next=/projects/${item.id}`}>Sign in</Link>
                <Link className="btn btnGhost" to={`/signup?next=/projects/${item.id}`}>Create account</Link>
              </div>
            </Card>
          ) : (
            <div className="inlineList">
              <Button variant="primary" onClick={() => setCommentModal(true)}>Add comment</Button>
              <Button variant="amber" onClick={() => setReportModal(true)}>Report issue</Button>
            </div>
          )}

          {socialErr ? <div className="errorCard">{socialErr}</div> : null}
          {actionErr ? <div className="errorCard">{actionErr}</div> : null}

          <Card className="stack" style={{ padding: 18 }}>
            <strong>Comments</strong>
            {socialLoading ? (
              <div className="muted">Loading comments…</div>
            ) : comments.length === 0 ? (
              <div className="muted">No comments yet.</div>
            ) : (
              <div className="stack">
                {comments.map((c) => (
                  <div key={c.id} className="card projectCard">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <strong>{c.user_username || "Citizen"}</strong>
                      <span className="muted">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="muted" style={{ whiteSpace: "pre-wrap" }}>{c.body}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="stack" style={{ padding: 18 }}>
            <strong>Reports</strong>
            {socialLoading ? (
              <div className="muted">Loading reports…</div>
            ) : reports.length === 0 ? (
              <div className="muted">No reports yet.</div>
            ) : (
              <div className="stack">
                {reports.map((r) => (
                  <div key={r.id} className="card projectCard">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <strong>{r.category}</strong>
                      <span className="badge">{r.status}</span>
                    </div>
                    <div className="muted" style={{ whiteSpace: "pre-wrap" }}>{r.description}</div>
                    <div className="muted" style={{ fontSize: 12 }}>Filed by {r.user_username || "Citizen"}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div style={{ marginBottom: 12 }}>
        <button className="btn btnGhost" onClick={handleBack}>← Back</button>
      </div>

      <Tabs items={tabs} />

      <Modal
        isOpen={commentModal}
        onClose={() => setCommentModal(false)}
        title="Add a comment"
        actions={
          <>
            <Button variant="ghost" onClick={() => setCommentModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={submitComment}>Submit</Button>
          </>
        }
      >
        <textarea
          className="textarea"
          rows={5}
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          placeholder="Share what you’ve noticed about this project…"
          aria-label="Comment"
        />
      </Modal>

      <Modal
        isOpen={reportModal}
        onClose={() => setReportModal(false)}
        title="Report an issue"
        actions={
          <>
            <Button variant="ghost" onClick={() => setReportModal(false)}>Cancel</Button>
            <Button variant="amber" onClick={submitReport}>Submit report</Button>
          </>
        }
      >
        <div className="stack">
          <label className="stack" style={{ gap: 6 }}>
            <span className="fieldLabel">Category</span>
            <select className="select" value={reportCategory} onChange={(e) => setReportCategory(e.target.value)}>
              <option value="CORRUPTION">Corruption</option>
              <option value="DELAY">Delay</option>
              <option value="QUALITY">Quality issue</option>
              <option value="BUDGET">Budget concern</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <textarea
            className="textarea"
            rows={5}
            value={reportBody}
            onChange={(e) => setReportBody(e.target.value)}
            placeholder="Describe the issue with as much detail as possible…"
            aria-label="Report description"
          />
        </div>
      </Modal>
    </div>
  );
}
