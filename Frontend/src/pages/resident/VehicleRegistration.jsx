import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import { Plus } from "lucide-react";

const typeOptions = [
  { value: "car", label: "Car" },
  { value: "two_wheeler", label: "Two-wheeler" },
];

export default function VehicleRegistration() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plate: "", type: "car" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    setLoading(true);
    try {
      const data = await api.get("/vehicles/");
      setVehicles(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.plate.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/vehicles/", { plate: form.plate.toUpperCase(), type: form.type });
      setForm({ plate: "", type: "car" });
      setShowForm(false);
      await loadVehicles();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Vehicles"
        title="Vehicle registration"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors"
          >
            <Plus size={16} /> Register vehicle
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                License plate
              </label>
              <input
                autoFocus
                value={form.plate}
                onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
                placeholder="UP32 AB 1234"
                className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono focus-visible:outline-amber"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Vehicle type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              >
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit for allocation"}
            </button>
          </form>
          {error && <p className="text-xs text-rust mt-3">{error}</p>}
          <p className="text-xs text-slate mt-3">
            Once submitted, the system automatically suggests an available slot in your block. An admin confirms the final allocation.
          </p>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading vehicles…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
                <th className="px-5 py-3 font-medium">Plate</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Assigned slot</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-mono">{v.plate}</td>
                  <td className="px-5 py-3">
                    {typeOptions.find((o) => o.value === v.type)?.label || v.type}
                  </td>
                  <td className="px-5 py-3 font-mono">{v.slot || "—"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate text-sm">
                    No vehicles registered yet.
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