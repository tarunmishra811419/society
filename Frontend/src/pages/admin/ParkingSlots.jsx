import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import ParkingGrid from "../../components/ParkingGrid";
import { api } from "../../api/client";

export default function ParkingSlots() {
  const [slots, setSlots] = useState([]);
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allocating, setAllocating] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [slotsData, vehiclesData] = await Promise.all([
        api.get("/parking/slots/"),
        api.get("/vehicles/"),
      ]);
      setSlots(slotsData.results);
      setPendingVehicles(vehiclesData.results.filter((v) => v.status === "pending"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAllocate(vehicleId) {
    setAllocating(vehicleId);
    setError("");
    try {
      await api.post(`/parking/slots/allocate/${vehicleId}/`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAllocating(null);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading…</div>;
  }

  return (
    <div>
      <PageHeader eyebrow="Parking" title="Slot allocation" />

      {error && (
        <div className="text-sm text-rust bg-rust-soft/20 border border-rust/30 rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 col-span-2">
          <ParkingGrid slots={slots} onSelect={setSelected} />
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="font-display font-semibold mb-3">Slot detail</div>
            {selected ? (
              <div className="space-y-2 text-sm">
                <div className="font-mono text-lg font-semibold">{selected.code}</div>
                <StatusBadge status={selected.status} />
                <div className="text-slate pt-2">
                  {selected.assigned_to || "No vehicle assigned"}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate">Click a slot on the map to see details.</p>
            )}
          </Card>

          <Card className="p-5">
            <div className="font-display font-semibold mb-3">Awaiting allocation</div>
            <p className="text-xs text-slate mb-3">
              New registrations run through automatic slot suggestion first — an
              admin confirms before it's final.
            </p>
            <div className="space-y-2">
              {pendingVehicles.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-sm border-b border-line last:border-0 pb-2 last:pb-0">
                  <div>
                    <div className="font-mono">{v.plate}</div>
                  </div>
                  <button
                    onClick={() => handleAllocate(v.id)}
                    disabled={allocating === v.id}
                    className="text-xs font-medium text-ink bg-amber-soft px-2.5 py-1 rounded-md hover:bg-amber transition-colors disabled:opacity-60"
                  >
                    {allocating === v.id ? "Allocating…" : "Suggest slot"}
                  </button>
                </div>
              ))}
              {pendingVehicles.length === 0 && (
                <p className="text-xs text-slate">Nothing pending.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}