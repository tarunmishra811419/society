import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import { Plus } from "lucide-react";

export default function GuestApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/visitors/guest-approvals/");
      setRequests(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addRequest(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/visitors/guest-approvals/", {
        visitor_name: name,
        purpose: purpose || "Guest visit",
      });
      setName("");
      setPurpose("");
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
        eyebrow="Guests"
        title="Guest approval"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors"
          >
            <Plus size={16} /> Pre-approve a guest
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={addRequest} className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Guest name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Purpose
              </label>
              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
                placeholder="e.g. Family visit"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="col-span-2 bg-amber text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send for approval"}
            </button>
          </form>
          {error && <p className="text-xs text-rust mt-3">{error}</p>}
          <p className="text-xs text-slate mt-3">
            Security sees this at the gate and issues a QR pass once approved.
          </p>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Purpose</th>
                <th className="px-5 py-3 font-medium">Requested</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-medium">{r.visitor_name}</td>
                  <td className="px-5 py-3 text-slate">{r.purpose}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate text-sm">
                    No guest requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}