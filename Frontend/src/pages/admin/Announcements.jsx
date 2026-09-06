import { useState, useEffect } from "react";
import { PageHeader, Card } from "../../components/UI";
import { api } from "../../api/client";
import { Plus, AlertTriangle } from "lucide-react";

export default function Announcements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/announcements/");
      setList(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/announcements/", {
        title,
        body,
        priority: urgent ? "urgent" : "normal",
      });
      setTitle("");
      setBody("");
      setUrgent(false);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Communication"
        title="Announcements"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors"
          >
            <Plus size={16} /> New announcement
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Title
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
              Mark as emergency — pushes an immediate notification to all residents
            </label>
            {error && <p className="text-xs text-rust">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post announcement"}
            </button>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-sm text-slate p-8 text-center">Loading…</div>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <Card
              key={a.id}
              className={`p-4 ${a.priority === "urgent" ? "border-rust/40 bg-rust-soft/40" : ""}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {a.priority === "urgent" && <AlertTriangle size={15} className="text-rust" />}
                  <span className="font-display font-semibold text-sm">{a.title}</span>
                </div>
                <span className="font-mono text-xs text-slate">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate">{a.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}