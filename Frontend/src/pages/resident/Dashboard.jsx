import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge, StatTile } from "../../components/UI";
import { api } from "../../api/client";
import { useAuth } from "../../context/useAuth";

// Backend sends "in_progress" (underscore); StatusBadge expects "in-progress" (hyphen)
function normalizeStatus(status) {
  return status?.replace(/_/g, "-");
}

export default function ResidentDashboard() {
  const { currentUser } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [fees, setFees] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError("");
      try {
        const [vehiclesData, feesData, complaintsData, announcementsData] = await Promise.all([
          api.get("/vehicles/"),
          api.get("/billing/fees/"),
          api.get("/complaints/"),
          api.get("/announcements/"),
        ]);
        setVehicles(vehiclesData.results);
        setFees(feesData.results);
        setComplaints(complaintsData.results);
        setAnnouncements(announcementsData.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading dashboard…</div>;
  }
  if (error) {
    return <div className="text-sm text-rust p-8 text-center">{error}</div>;
  }

  const dueFee = fees.find((f) => f.status === "due");
  const openComplaints = complaints.filter((c) => c.status !== "resolved").length;

  return (
    <div>
      <PageHeader
        eyebrow={`Flat ${currentUser?.flat}`}
        title={`Welcome back, ${currentUser?.name?.split(" ")[0] || currentUser?.username}`}
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatTile label="Registered vehicles" value={vehicles.length} />
        <StatTile
          label="Maintenance due"
          value={dueFee ? `₹${Number(dueFee.amount).toLocaleString()}` : "₹0"}
          sub={dueFee ? dueFee.period : "All caught up"}
        />
        <StatTile label="Open complaints" value={openComplaints} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="font-display font-semibold mb-4">Your vehicles</div>
          <div className="space-y-3">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-sm border-b border-line last:border-0 pb-3 last:pb-0">
                <div>
                  <div className="font-mono font-medium">{v.plate}</div>
                  <div className="text-xs text-slate">
                    {v.type === "two_wheeler" ? "Two-wheeler" : "Car"} · Slot {v.slot || "unassigned"}
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
            {vehicles.length === 0 && (
              <p className="text-sm text-slate">No vehicles registered yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="font-display font-semibold mb-4">Society announcements</div>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="text-sm border-b border-line last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  {a.priority === "urgent" && <StatusBadge status="open" />}
                  <span className="font-medium">{a.title}</span>
                </div>
                <p className="text-xs text-slate">{a.body}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-slate">No announcements yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}