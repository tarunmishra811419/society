import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import { Plus } from "lucide-react";

const categories = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "security", label: "Security" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
];

export default function Complaints() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("plumbing");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/complaints/");
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
      await api.post("/complaints/", { title, category });
      setTitle("");
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
        eyebrow="Support"
        title="Complaints"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors"
          >
            <Plus size={16} /> Raise a complaint
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={submit} className="grid grid-cols-3 gap-4 items-end">
            <div className="col-span-2">
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Describe the issue
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
                placeholder="e.g. Leaking pipe near lift lobby"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="col-span-3 bg-amber text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit complaint"}
            </button>
          </form>
          {error && <p className="text-xs text-rust mt-3">{error}</p>}
        </Card>
      )}

      {loading ? (
        <div className="text-sm text-slate p-8 text-center">Loading…</div>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <Card key={c.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{c.title}</div>
                <div className="text-xs text-slate mt-1 font-mono">
                  {categories.find((cat) => cat.value === c.category)?.label || c.category} · raised{" "}
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
              </div>
              <StatusBadge status={c.status.replace(/_/g, "-")} />
            </Card>
          ))}
          {list.length === 0 && (
            <p className="text-sm text-slate text-center py-8">No complaints yet.</p>
          )}
        </div>
      )}
    </div>
  );
}