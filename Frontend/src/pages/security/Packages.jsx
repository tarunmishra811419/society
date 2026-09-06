import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import { Plus, Package, Camera } from "lucide-react";

export default function Packages() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [courier, setCourier] = useState("");
  const [flat, setFlat] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/visitors/packages/");
      setList(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!courier.trim() || !flat.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/visitors/packages/", { courier, flat_number: flat.toUpperCase() });
      setCourier("");
      setFlat("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const waiting = list.filter((p) => p.status === "waiting");

  return (
    <div>
      <PageHeader
        eyebrow="Gate"
        title="Package log"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors"
          >
            <Plus size={16} /> Log a package
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={submit} className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Courier / company
              </label>
              <input
                autoFocus
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="e.g. Amazon, Zomato"
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Flat number
              </label>
              <input
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="e.g. B-204"
                className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono focus-visible:outline-amber"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-1.5 bg-amber text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60"
            >
              <Camera size={15} /> {submitting ? "Logging…" : "Log with photo"}
            </button>
          </form>
          {error && <p className="text-xs text-rust mt-3">{error}</p>}
          <p className="text-xs text-slate mt-3">
            Resident gets notified instantly and can mark it collected from their app.
          </p>
        </Card>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-line font-display font-semibold flex items-center justify-between">
          <span>Waiting for pickup</span>
          <span className="font-mono text-xs text-slate">{waiting.length} packages</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
                <th className="px-5 py-3 font-medium">Courier</th>
                <th className="px-5 py-3 font-medium">Flat</th>
                <th className="px-5 py-3 font-medium">Logged</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 flex items-center gap-2">
                    <Package size={14} className="text-slate" />
                    {p.courier}
                  </td>
                  <td className="px-5 py-3 font-mono">{p.flat_number}</td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {new Date(p.logged_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status === "waiting" ? "pending" : "resolved"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}