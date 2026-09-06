import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge, StatTile } from "../../components/UI";
import { api } from "../../api/client";
import { useAlerts } from "../../context/useAlerts";
import { Siren, CheckCircle2 } from "lucide-react";

export default function SecurityDashboard() {
  const { sosAlerts, resolveSOS } = useAlerts();
  const [visitors, setVisitors] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [urgentAnnouncement, setUrgentAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [visitorsData, approvalsData, announcementsData] = await Promise.all([
          api.get("/visitors/passes/"),
          api.get("/visitors/guest-approvals/"),
          api.get("/announcements/"),
        ]);
        setVisitors(visitorsData.results);
        setPendingApprovals(approvalsData.results.filter((a) => a.status === "pending").length);
        const urgent = announcementsData.results.find((a) => a.priority === "urgent");
        setUrgentAnnouncement(urgent || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const activeAlerts = sosAlerts.filter((a) => a.status === "active");
  const checkedIn = visitors.filter((v) => v.status === "checked_in").length;

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading…</div>;
  }
  if (error) {
    return <div className="text-sm text-rust p-8 text-center">{error}</div>;
  }

  return (
    <div>
      <PageHeader eyebrow="Main Gate" title="Gate activity — today" />

      {activeAlerts.length > 0 && (
        <div className="space-y-3 mb-6">
          {activeAlerts.map((a) => (
            <Card
              key={a.id}
              className="p-4 border-rust bg-rust-soft flex items-center justify-between animate-scale-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rust text-paper flex items-center justify-center shrink-0 animate-pulse-dot">
                  <Siren size={18} />
                </div>
                <div>
                  <div className="font-display font-semibold text-sm text-rust">
                    SOS — {a.residentName} · Flat {a.flat}
                  </div>
                  <div className="text-xs text-slate font-mono">Raised {a.raisedAt}</div>
                </div>
              </div>
              <button
                onClick={() => resolveSOS(a.id)}
                className="flex items-center gap-1.5 bg-ink text-paper text-xs font-medium px-3 py-2 rounded-lg hover:bg-ink-soft transition-colors"
              >
                <CheckCircle2 size={14} /> Mark resolved
              </button>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatTile label="Visitors on premises" value={checkedIn} />
        <StatTile label="Pending approvals" value={pendingApprovals} sub="Awaiting resident sign-off" />
        <StatTile label="Total logged" value={visitors.length} />
      </div>

      {urgentAnnouncement && (
        <Card className="p-4 mb-6 border-rust/40 bg-rust-soft/50">
          <div className="font-mono text-xs uppercase tracking-wide text-rust mb-1">
            Emergency announcement
          </div>
          <div className="font-semibold text-sm">{urgentAnnouncement.title}</div>
          <p className="text-xs text-slate mt-1">{urgentAnnouncement.body}</p>
        </Card>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-line font-display font-semibold">
          Recent gate log
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
              <th className="px-5 py-3 font-medium">Visitor</th>
              <th className="px-5 py-3 font-medium">Host flat</th>
              <th className="px-5 py-3 font-medium">Purpose</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v) => (
              <tr key={v.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium">{v.name}</td>
                <td className="px-5 py-3 font-mono">{v.host_flat}</td>
                <td className="px-5 py-3 text-slate">{v.purpose}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={v.status.replace(/_/g, "-")} />
                </td>
              </tr>
            ))}
            {visitors.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate text-sm">
                  No visitors logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}