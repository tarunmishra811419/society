import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge, StatTile } from "../../components/UI";
import { api } from "../../api/client";
import { useAlerts } from "../../context/useAlerts";
import { Siren, CheckCircle2, ShieldCheck, Users, Clock, PackageCheck, AlertTriangle } from "lucide-react";

export default function SecurityDashboard() {
  const { sosAlerts, resolveSOS } = useAlerts();
  const [stats, setStats] = useState(null);
  const [insideList, setInsideList] = useState([]);
  const [urgentAnnouncement, setUrgentAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [statsData, insideData, announcementsData] = await Promise.all([
          api.get("/visitors/passes/gate-stats/"),
          api.get("/visitors/passes/active-inside/"),
          api.get("/announcements/"),
        ]);
        setStats(statsData);
        setInsideList(insideData.results ?? insideData ?? []);
        const announcementsList = Array.isArray(announcementsData) ? announcementsData : (announcementsData?.results ?? []);
        const urgent = announcementsList.find((a) => a.priority === "urgent");
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

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading gate operations dashboard…</div>;
  }
  if (error) {
    return <div className="text-sm text-rust p-8 text-center">{error}</div>;
  }

  return (
    <div>
      <PageHeader eyebrow="Main Gate Operations" title="Gate Command Center" />

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
                    SOS EMERGENCY ALERT — {a.residentName} · Flat {a.flat}
                  </div>
                  <div className="text-xs text-slate font-mono">Triggered {a.raisedAt}</div>
                </div>
              </div>
              <button
                onClick={() => resolveSOS(a.id)}
                className="flex items-center gap-1.5 bg-ink text-paper text-xs font-medium px-3 py-2 rounded-lg hover:bg-ink-soft transition-colors"
              >
                <CheckCircle2 size={14} /> Respond & Resolve
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Real-time Stat Tiles */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatTile
          label="Inside Society Now"
          value={stats?.inside_count ?? 0}
          sub={`${stats?.overstay_count ?? 0} extended stays (>4h)`}
        />
        <StatTile
          label="Today's Entries"
          value={stats?.today_entries ?? 0}
          sub={`${stats?.today_exits ?? 0} checked out`}
        />
        <StatTile
          label="Pending Approvals"
          value={stats?.pending_approvals ?? 0}
          sub="Awaiting resident sign-off"
        />
        <StatTile
          label="Packages at Gate"
          value={stats?.waiting_packages ?? 0}
          sub="Awaiting resident pickup"
        />
      </div>

      {urgentAnnouncement && (
        <Card className="p-4 mb-6 border-rust/40 bg-rust-soft/50">
          <div className="font-mono text-xs uppercase tracking-wide text-rust mb-1">
            Emergency circular
          </div>
          <div className="font-semibold text-sm">{urgentAnnouncement.title}</div>
          <p className="text-xs text-slate mt-1">{urgentAnnouncement.body}</p>
        </Card>
      )}

      {/* Live Campus Occupancy Widget */}
      <Card className="mb-8">
        <div className="px-5 py-4 border-b border-line font-display font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users size={18} /> Live Campus Visitor Log
          </span>
          <span className="text-xs font-mono text-slate">{insideList.length} currently inside</span>
        </div>
        <div className="divide-y divide-line">
          {insideList.map((v) => {
            const overstay = (v.stay_duration_minutes || 0) > 240;
            return (
              <div key={v.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    overstay ? "bg-amber/20 text-amber" : "bg-green/10 text-green"
                  }`}>
                    {v.name?.[0] || "V"}
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {v.name}
                      {overstay && (
                        <span className="text-xs bg-amber/15 text-amber px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <AlertTriangle size={11} /> Stay &gt; 4h
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate font-mono">
                      Host: {v.host_flat} · Phone: {v.phone || "—"} · Gate: {v.entry_gate || "Main Gate"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-medium">
                    In for {Math.floor((v.stay_duration_minutes || 0) / 60)}h {(v.stay_duration_minutes || 0) % 60}m
                  </div>
                  <div className="text-[11px] text-slate font-mono">
                    Entered: {v.checked_in_at ? new Date(v.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </div>
                </div>
              </div>
            );
          })}
          {insideList.length === 0 && (
            <div className="px-5 py-8 text-center text-slate text-sm">
              No visitors currently inside the society premises.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}