import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import { Package, Camera } from "lucide-react";

export default function Packages() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collecting, setCollecting] = useState(null);

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

  async function markCollected(id) {
    setCollecting(id);
    setError("");
    try {
      await api.post(`/visitors/packages/${id}/collect/`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCollecting(null);
    }
  }

  const waiting = list.filter((p) => p.status === "waiting");

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading…</div>;
  }

  return (
    <div>
      <PageHeader eyebrow="At the gate" title="Packages" />

      {error && (
        <div className="text-sm text-rust bg-rust-soft/20 border border-rust/30 rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {waiting.length > 0 && (
        <div className="mb-6 space-y-3">
          {waiting.map((p) => (
            <Card key={p.id} className="p-4 flex items-center justify-between border-amber/30 bg-amber-soft/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-soft flex items-center justify-center text-ink shrink-0">
                  <Package size={18} />
                </div>
                <div>
                  <div className="font-medium text-sm">{p.courier}</div>
                  <div className="text-xs text-slate font-mono">
                    Logged {new Date(p.logged_at).toLocaleString()} {p.has_photo && "· photo on file"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => markCollected(p.id)}
                disabled={collecting === p.id}
                className="text-xs font-medium text-ink bg-amber px-3 py-1.5 rounded-md hover:bg-amber/90 transition-colors disabled:opacity-60"
              >
                {collecting === p.id ? "Marking…" : "Mark collected"}
              </button>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-line font-display font-semibold">
          History
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
              <th className="px-5 py-3 font-medium">Courier</th>
              <th className="px-5 py-3 font-medium">Logged</th>
              <th className="px-5 py-3 font-medium">Photo</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium">{p.courier}</td>
                <td className="px-5 py-3 font-mono text-xs">{new Date(p.logged_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  {p.has_photo ? <Camera size={14} className="text-slate" /> : "—"}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={p.status === "waiting" ? "pending" : "resolved"} />
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate text-sm">
                  No packages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}