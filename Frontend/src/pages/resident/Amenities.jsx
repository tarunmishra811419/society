import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import { Plus, CalendarClock } from "lucide-react";

export default function Amenities() {
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [amenityId, setAmenityId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [amenitiesData, bookingsData] = await Promise.all([
        api.get("/parking/amenities/"),
        api.get("/parking/amenity-bookings/"),
      ]);
      setAmenities(amenitiesData.results);
      setBookings(bookingsData.results);
      if (amenitiesData.results.length > 0 && !amenityId) {
        setAmenityId(amenitiesData.results[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!date.trim() || !slot.trim() || !amenityId) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/parking/amenity-bookings/", { amenity: amenityId, date, slot });
      setDate("");
      setSlot("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading…</div>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Shared spaces"
        title="Amenity booking"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors"
          >
            <Plus size={16} /> Book a slot
          </button>
        }
      />

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={submit} className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Amenity
              </label>
              <select
                value={amenityId}
                onChange={(e) => setAmenityId(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              >
                {amenities.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Time slot
              </label>
              <input
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                placeholder="e.g. 6:00 PM - 8:00 PM"
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              />
            </div>
            {error && <p className="col-span-3 text-xs text-rust">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="col-span-3 bg-amber text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60"
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {amenities.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="font-display font-semibold text-sm mb-1">{a.name}</div>
            <div className="text-xs text-slate">{a.capacity} · {a.slot_length} slots</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-line font-display font-semibold">
          Your bookings
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
              <th className="px-5 py-3 font-medium">Amenity</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Slot</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 flex items-center gap-2">
                  <CalendarClock size={14} className="text-slate" />
                  {b.amenity_name}
                </td>
                <td className="px-5 py-3 font-mono text-xs">{b.date}</td>
                <td className="px-5 py-3 font-mono text-xs">{b.slot}</td>
                <td className="px-5 py-3">
                  <StatusBadge status="approved" />
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate text-sm">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}