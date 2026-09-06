import { useState, useEffect } from "react";
import { PageHeader, Card, StatTile } from "../../components/UI";
import { api } from "../../api/client";

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [feesData, complaintsData, slotsData] = await Promise.all([
          api.get("/billing/fees/"),
          api.get("/complaints/"),
          api.get("/parking/slots/"),
        ]);

        const fees = feesData.results;
        const collected = fees
          .filter((f) => f.status === "paid")
          .reduce((sum, f) => sum + Number(f.amount), 0);
        const outstanding = fees
          .filter((f) => f.status !== "paid")
          .reduce((sum, f) => sum + Number(f.amount), 0);

        const complaints = complaintsData.results;
        const openComplaints = complaints.filter((c) => c.status !== "resolved").length;

        const slots = slotsData.results;
        const occupied = slots.filter((s) => s.status === "occupied").length;
        const occupancyRate = slots.length ? Math.round((occupied / slots.length) * 100) : 0;

        setStats({ collected, outstanding, openComplaints, occupied, total: slots.length, occupancyRate });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading…</div>;
  }
  if (error) {
    return <div className="text-sm text-rust p-8 text-center">{error}</div>;
  }

  return (
    <div>
      <PageHeader eyebrow="Society overview" title="Reports" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatTile label="Fees collected" value={`₹${stats.collected.toLocaleString()}`} />
        <StatTile label="Fees outstanding" value={`₹${stats.outstanding.toLocaleString()}`} />
        <StatTile label="Open complaints" value={stats.openComplaints} />
      </div>

      <Card className="p-6">
        <div className="font-display font-semibold mb-4">Parking occupancy</div>
        <div className="flex items-end gap-6">
          <div>
            <div className="font-display text-3xl font-semibold text-ink">
              {stats.occupancyRate}%
            </div>
            <div className="text-xs text-slate mt-1">
              {stats.occupied} of {stats.total} slots occupied
            </div>
          </div>
          <div className="flex-1 h-3 bg-mist rounded-full overflow-hidden">
            <div
              className="h-full bg-amber transition-all duration-500"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-slate mt-4">
          Historical month-over-month trends will populate here once the society has
          accumulated more than one billing period of real data.
        </p>
      </Card>
    </div>
  );
}