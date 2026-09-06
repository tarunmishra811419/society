import { useState, useEffect } from "react";
import { PageHeader, Card } from "../../components/UI";
import { api } from "../../api/client";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.get("/audit/logs/");
        setLogs(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader eyebrow="Accountability" title="Audit logs" />

      {error && (
        <div className="text-sm text-rust bg-rust-soft/20 border border-rust/30 rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Target</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-slate">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-medium">{log.actor_name || "System"}</td>
                  <td className="px-5 py-3">{log.action}</td>
                  <td className="px-5 py-3 font-mono text-xs">{log.target}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate text-sm">
                    No audit entries yet — every real action across the app appends
                    one here automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <p className="text-xs text-slate mt-4">
        Every write action in the backend — approvals, slot reassignments, fee
        payments — appends an immutable audit entry, keyed by actor, action, target,
        and timestamp.
      </p>
    </div>
  );
}