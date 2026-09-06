import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import { Plus, UserCheck } from "lucide-react";

const roles = [
  { value: "maid", label: "Maid" },
  { value: "cook", label: "Cook" },
  { value: "driver", label: "Driver" },
  { value: "nanny", label: "Nanny" },
  { value: "other", label: "Other" },
];

export default function StaffPasses() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("maid");
  const [validTill, setValidTill] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/visitors/staff-passes/");
      setList(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || !validTill) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/visitors/staff-passes/", { name, role, valid_till: validTill });
      setName("");
      setValidTill("");
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
        eyebrow="Recurring access"
        title="Domestic help & staff passes"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors"
          >
            <Plus size={16} /> Add staff pass
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={submit} className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Full name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Valid till
              </label>
              <input
                type="date"
                value={validTill}
                onChange={(e) => setValidTill(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              />
            </div>
            {error && <p className="col-span-3 text-xs text-rust">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="col-span-3 bg-amber text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60"
            >
              {submitting ? "Issuing..." : "Issue non-expiring gate QR"}
            </button>
          </form>
          <p className="text-xs text-slate mt-3">
            Unlike guest passes, this QR works every day until the valid-till date —
            no daily approval needed.
          </p>
        </Card>
      )}

      {loading ? (
        <div className="text-sm text-slate p-8 text-center">Loading…</div>
      ) : (
        <div className="space-y-3">
          {list.map((s) => (
            <Card key={s.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-mist flex items-center justify-center text-ink shrink-0">
                  <UserCheck size={18} />
                </div>
                <div>
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-xs text-slate font-mono">
                    {roles.find((r) => r.value === s.role)?.label} · {s.qr_code} · valid till{" "}
                    {new Date(s.valid_till).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <StatusBadge status={s.status === "active" ? "active" : s.status === "expiring" ? "pending" : "overdue"} />
            </Card>
          ))}
          {list.length === 0 && (
            <p className="text-sm text-slate text-center py-8">No staff passes yet.</p>
          )}
        </div>
      )}
    </div>
  );
}