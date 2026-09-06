import { useState, useEffect } from "react";
import { PageHeader, Card, StatTile } from "../../components/UI";
import ParkingGrid from "../../components/ParkingGrid";
import { api } from "../../api/client";

export default function AdminDashboard() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/parking/slots/");
      setSlots(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading…</div>;
  }
  if (error) {
    return <div className="text-sm text-rust p-8 text-center">{error}</div>;
  }

  const available = slots.filter((s) => s.status === "available").length;
  const occupied = slots.filter((s) => s.status === "occupied").length;
  const occupancyRate = slots.length ? Math.round((occupied / slots.length) * 100) : 0;

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Society control room" />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatTile label="Total slots" value={slots.length} />
        <StatTile label="Available" value={available} />
        <StatTile label="Occupied" value={occupied} />
        <StatTile label="Occupancy" value={`${occupancyRate}%`} />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="font-display font-semibold">Live parking map</div>
          <span className="font-mono text-xs text-slate">Live from database</span>
        </div>
        <ParkingGrid slots={slots} />
      </Card>
    </div>
  );
}