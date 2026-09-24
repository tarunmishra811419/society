import { useState, useEffect, useCallback } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import { Plus, Package, CheckCircle2, User, Phone, MapPin, Hash } from "lucide-react";

const COURIER_BRANDS = [
  { name: "Amazon", color: "bg-amber/10 border-amber/30 text-ink" },
  { name: "Flipkart", color: "bg-blue-500/10 border-blue-500/30 text-blue-700" },
  { name: "Swiggy", color: "bg-orange-500/10 border-orange-500/30 text-orange-700" },
  { name: "Zomato", color: "bg-red-500/10 border-red-500/30 text-red-700" },
  { name: "Blinkit", color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-800" },
  { name: "Zepto", color: "bg-purple-500/10 border-purple-500/30 text-purple-700" },
  { name: "BlueDart", color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-700" },
  { name: "Other", color: "bg-line border-slate/30 text-slate" },
];

export default function Packages() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [courier, setCourier] = useState("Amazon");
  const [customCourier, setCustomCourier] = useState("");
  const [flat, setFlat] = useState("");
  const [deliveryPersonName, setDeliveryPersonName] = useState("");
  const [deliveryPersonPhone, setDeliveryPersonPhone] = useState("");
  const [trackingPin, setTrackingPin] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/visitors/packages/");
      setList(data.results ?? data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    const finalCourier = courier === "Other" ? customCourier : courier;
    if (!finalCourier.trim() || !flat.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await api.post("/visitors/packages/", {
        courier: finalCourier,
        flat_number: flat.toUpperCase(),
        delivery_person_name: deliveryPersonName,
        delivery_person_phone: deliveryPersonPhone,
        tracking_pin: trackingPin,
      });

      setFlat("");
      setDeliveryPersonName("");
      setDeliveryPersonPhone("");
      setTrackingPin("");
      setCustomCourier("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const waiting = list.filter((p) => p.status === "waiting");

  return (
    <div>
      <PageHeader
        eyebrow="Gate Security"
        title="Delivery & Package Management"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors"
          >
            <Plus size={16} /> Log New Delivery
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 mb-6 animate-scale-in">
          <div className="font-display font-semibold mb-4">Log Incoming Package / Delivery</div>
          <form onSubmit={submit} className="space-y-4">
            {/* Courier Chip Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-2">
                Select Courier / App Service
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {COURIER_BRANDS.map((brand) => (
                  <button
                    key={brand.name}
                    type="button"
                    onClick={() => setCourier(brand.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      courier === brand.name
                        ? "bg-ink text-paper border-ink scale-105 shadow-sm"
                        : `${brand.color} hover:opacity-80`
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
              {courier === "Other" && (
                <input
                  value={customCourier}
                  onChange={(e) => setCustomCourier(e.target.value)}
                  placeholder="Specify Courier Name"
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm mt-2 focus-visible:outline-amber"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  <MapPin size={11} className="inline mr-1" /> Flat Number *
                </label>
                <input
                  value={flat}
                  onChange={(e) => setFlat(e.target.value)}
                  placeholder="e.g. B-204"
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono uppercase focus-visible:outline-amber"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  <Hash size={11} className="inline mr-1" /> Tracking PIN (Optional)
                </label>
                <input
                  value={trackingPin}
                  onChange={(e) => setTrackingPin(e.target.value)}
                  placeholder="e.g. 4-digit code"
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono focus-visible:outline-amber"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  <User size={11} className="inline mr-1" /> Delivery Person Name
                </label>
                <input
                  value={deliveryPersonName}
                  onChange={(e) => setDeliveryPersonName(e.target.value)}
                  placeholder="Agent Name"
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  <Phone size={11} className="inline mr-1" /> Agent Contact Number
                </label>
                <input
                  value={deliveryPersonPhone}
                  onChange={(e) => setDeliveryPersonPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
                />
              </div>
            </div>

            {error && <p className="text-xs text-rust">{error}</p>}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-amber text-ink text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Package size={16} />
                {submitting ? "Logging Delivery…" : "Log Package & Notify Resident"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-lg border border-line text-sm hover:bg-line/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Package List */}
      <Card>
        <div className="px-5 py-4 border-b border-line font-display font-semibold flex items-center justify-between">
          <span>Gate Packages & Deliveries</span>
          <span className="font-mono text-xs text-slate">{waiting.length} waiting for pickup</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading deliveries…</div>
        ) : (
          <div className="divide-y divide-line">
            {list.map((p) => (
              <div key={p.id} className="px-5 py-4 flex items-center justify-between hover:bg-line/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-soft flex items-center justify-center text-ink shrink-0 font-bold">
                    <Package size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      <span className="font-semibold text-ink">{p.courier}</span>
                      <span className="text-xs font-mono bg-line px-2 py-0.5 rounded text-slate">
                        Flat {p.flat_number}
                      </span>
                    </div>
                    <div className="text-xs text-slate mt-0.5 font-mono">
                      Logged: {new Date(p.logged_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      {p.delivery_person_name && ` · Agent: ${p.delivery_person_name}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status === "waiting" ? "pending" : "resolved"} />
                </div>
              </div>
            ))}

            {list.length === 0 && (
              <div className="px-5 py-8 text-center text-slate text-sm">
                No packages logged at the gate right now.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}