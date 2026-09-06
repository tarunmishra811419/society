import { useState } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { amenities, amenityBookings as initial } from "../../data/mockData";
import { useAuth } from "../../context/useAuth";
import { Plus, CalendarClock } from "lucide-react";

export default function Amenities() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [amenityId, setAmenityId] = useState(amenities[0].id);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  const myBookings = bookings.filter((b) => b.flat === currentUser?.flat);

  function submit(e) {
    e.preventDefault();
    if (!date.trim() || !slot.trim()) return;
    const conflict = bookings.some(
      (b) => b.amenityId === amenityId && b.date === date && b.slot === slot
    );
    if (conflict) {
      alert("That slot is already booked — pick a different time.");
      return;
    }
    setBookings((prev) => [
      {
        id: `BK-${Math.floor(Math.random() * 90 + 10)}`,
        amenityId,
        flat: currentUser.flat,
        date,
        slot,
        status: "confirmed",
      },
      ...prev,
    ]);
    setDate("");
    setSlot("");
    setShowForm(false);
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 24 Aug 2026"
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
                placeholder="e.g. 6:00 PM – 8:00 PM"
                className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
              />
            </div>
            <button
              type="submit"
              className="col-span-3 bg-amber text-ink text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber/90 transition-colors"
            >
              Confirm booking
            </button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {amenities.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="font-display font-semibold text-sm mb-1">{a.name}</div>
            <div className="text-xs text-slate">{a.capacity} · {a.slotLength} slots</div>
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
            {myBookings.map((b) => (
              <tr key={b.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 flex items-center gap-2">
                  <CalendarClock size={14} className="text-slate" />
                  {amenities.find((a) => a.id === b.amenityId)?.name}
                </td>
                <td className="px-5 py-3 font-mono text-xs">{b.date}</td>
                <td className="px-5 py-3 font-mono text-xs">{b.slot}</td>
                <td className="px-5 py-3">
                  <StatusBadge status="approved" />
                </td>
              </tr>
            ))}
            {myBookings.length === 0 && (
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