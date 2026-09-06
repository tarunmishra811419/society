import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import { LogOut, LogIn, CheckCircle2, Circle } from "lucide-react";

export default function MoveInOut() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/auth/move-requests/");
      setRequests(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleItem(requestId, itemId) {
    setToggling(itemId);
    setError("");
    try {
      const updated = await api.post(`/auth/move-requests/${requestId}/checklist/${itemId}/toggle/`);
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
    } catch (err) {
      setError(err.message);
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading…</div>;
  }

  return (
    <div>
      <PageHeader eyebrow="Access lifecycle" title="Move-in / move-out" />

      {error && (
        <div className="text-sm text-rust bg-rust-soft/20 border border-rust/30 rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {requests.map((r) => {
          const doneCount = r.checklist.filter((c) => c.done).length;
          const allDone = doneCount === r.checklist.length && r.checklist.length > 0;
          const Icon = r.move_type === "move_out" ? LogOut : LogIn;
          return (
            <Card key={r.id} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rust-soft flex items-center justify-center text-rust shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-sm">
                      {r.resident_name} — {r.flat_number}
                    </div>
                    <div className="text-xs text-slate font-mono">
                      {r.move_type === "move_out" ? "Moving out" : "Moving in"} · requested for{" "}
                      {new Date(r.requested_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <StatusBadge status={allDone ? "resolved" : "in-progress"} />
              </div>

              <div className="space-y-2 pl-1">
                {r.checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(r.id, item.id)}
                    disabled={toggling === item.id}
                    className="flex items-center gap-2.5 text-sm w-full text-left py-1 group disabled:opacity-60"
                  >
                    {item.done ? (
                      <CheckCircle2 size={17} className="text-green shrink-0" />
                    ) : (
                      <Circle size={17} className="text-slate shrink-0 group-hover:text-ink transition-colors" />
                    )}
                    <span className={item.done ? "text-slate line-through" : ""}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate mt-3 font-mono">
                {doneCount} / {r.checklist.length} complete
              </div>
            </Card>
          );
        })}
        {requests.length === 0 && (
          <p className="text-sm text-slate text-center py-8">No pending move requests.</p>
        )}
      </div>
    </div>
  );
}