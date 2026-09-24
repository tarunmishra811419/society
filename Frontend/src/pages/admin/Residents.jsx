import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge, StatTile } from "../../components/UI";
import { api } from "../../api/client";
import { Search, User, Home, Phone, Mail, Car, AlertOctagon, UserCheck, X, Shield } from "lucide-react";

export default function ResidentDirectory() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/auth/residents/");
      setResidents(data.results ?? data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = residents.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.flat_number && r.flat_number.toLowerCase().includes(q)) ||
      (r.phone && r.phone.toLowerCase().includes(q)) ||
      (r.username && r.username.toLowerCase().includes(q))
    );
  });

  const totalFlatsOccupied = residents.length;
  const totalVehiclesRegistered = residents.reduce((acc, r) => acc + (r.vehicles?.length || 0), 0);
  const totalDefaulters = residents.filter((r) => (r.pending_fee_count || 0) > 0).length;

  return (
    <div>
      <PageHeader eyebrow="Admin Directory" title="Resident & Unit Directory" />

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatTile label="Occupied Units / Residents" value={totalFlatsOccupied} />
        <StatTile label="Registered Vehicles" value={totalVehiclesRegistered} />
        <StatTile label="Defaulters (Pending Fees)" value={totalDefaulters} sub="Fines/Bills pending" />
      </div>

      {/* Search Bar */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-3 text-slate" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Resident Name, Flat Number (e.g. B-204), Phone, or Username..."
            className="w-full border border-line rounded-xl pl-10 pr-4 py-2.5 text-sm focus-visible:outline-amber font-mono"
          />
        </div>
      </Card>

      {/* Resident Detail Modal */}
      {selectedResident && (
        <div
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedResident(null)}
        >
          <div
            className="max-w-lg w-full bg-paper border border-line rounded-2xl p-6 shadow-2xl animate-scale-in space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-soft text-ink font-bold flex items-center justify-center text-xl">
                  {selectedResident.flat_number || "R"}
                </div>
                <div>
                  <div className="text-xl font-display font-bold">{selectedResident.name || selectedResident.username}</div>
                  <div className="text-xs text-slate font-mono">Flat {selectedResident.flat_number} · Member since {new Date(selectedResident.date_joined).toLocaleDateString("en-IN")}</div>
                </div>
              </div>
              <button onClick={() => setSelectedResident(null)} className="text-slate hover:text-ink">
                <X size={20} />
              </button>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-mist p-3 rounded-xl flex items-center gap-2.5">
                <Phone size={15} className="text-slate shrink-0" />
                <div>
                  <div className="text-slate uppercase tracking-wide text-[10px] font-mono">Phone</div>
                  <div className="font-semibold text-ink">{selectedResident.phone || "Not provided"}</div>
                </div>
              </div>
              <div className="bg-mist p-3 rounded-xl flex items-center gap-2.5">
                <Mail size={15} className="text-slate shrink-0" />
                <div>
                  <div className="text-slate uppercase tracking-wide text-[10px] font-mono">Email</div>
                  <div className="font-semibold text-ink truncate">{selectedResident.email || `${selectedResident.username}@residentia.com`}</div>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-amber-soft/40 border border-amber/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate uppercase tracking-wide">Maintenance Dues</div>
                <div className="text-lg font-display font-bold text-ink">
                  ₹{selectedResident.total_due_amount.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                {selectedResident.pending_fee_count > 0 ? (
                  <span className="text-xs bg-rust text-paper font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <AlertOctagon size={12} /> {selectedResident.pending_fee_count} Pending Bill(s)
                  </span>
                ) : (
                  <span className="text-xs bg-green-soft text-green font-semibold px-2.5 py-1 rounded-full">
                    All Clearance Paid
                  </span>
                )}
              </div>
            </div>

            {/* Registered Vehicles */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wide text-slate mb-2 flex items-center gap-1.5">
                <Car size={14} /> Registered Vehicles ({selectedResident.vehicles?.length || 0})
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedResident.vehicles?.map((v) => (
                  <div key={v.id} className="border border-line rounded-lg p-2.5 text-xs flex items-center justify-between font-mono bg-paper">
                    <div>
                      <span className="font-bold text-ink">{v.plate}</span>
                      <span className="text-slate ml-2 capitalize">({v.type.replace("_", " ")})</span>
                    </div>
                    <span className="text-slate">Slot: <strong className="text-ink">{v.slot || "Unassigned"}</strong></span>
                  </div>
                ))}
                {(!selectedResident.vehicles || selectedResident.vehicles.length === 0) && (
                  <div className="text-xs text-slate italic">No vehicles registered.</div>
                )}
              </div>
            </div>

            {/* Staff Members */}
            <div className="pt-2 border-t border-line flex items-center justify-between text-xs text-slate">
              <span className="flex items-center gap-1.5 font-mono">
                <UserCheck size={14} /> Active Staff Passes:
              </span>
              <span className="font-bold text-ink">{selectedResident.staff_count} registered</span>
            </div>
          </div>
        </div>
      )}

      {/* Directory Table */}
      <Card>
        <div className="px-5 py-4 border-b border-line font-display font-semibold flex items-center justify-between">
          <span>All Registered Residents</span>
          <span className="font-mono text-xs text-slate">{filtered.length} entries</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading directory…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
                <th className="px-5 py-3 font-medium">Flat</th>
                <th className="px-5 py-3 font-medium">Resident Name</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Vehicles</th>
                <th className="px-5 py-3 font-medium">Dues Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedResident(r)}
                  className="border-b border-line last:border-0 hover:bg-line/30 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 font-mono font-bold text-ink">{r.flat_number}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{r.name || r.username}</div>
                    <div className="text-xs text-slate font-mono">{r.username}</div>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate">{r.phone || "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {r.vehicles?.length > 0 ? (
                      <span className="bg-amber-soft text-ink font-semibold px-2 py-0.5 rounded">
                        {r.vehicles.length} vehicle(s)
                      </span>
                    ) : (
                      <span className="text-slate">None</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {r.pending_fee_count > 0 ? (
                      <span className="text-xs text-rust font-semibold bg-rust-soft px-2 py-0.5 rounded-full">
                        ₹{r.total_due_amount.toLocaleString("en-IN")} Due
                      </span>
                    ) : (
                      <span className="text-xs text-green font-semibold bg-green-soft px-2 py-0.5 rounded-full">
                        Clean
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResident(r);
                      }}
                      className="text-xs bg-ink text-paper px-3 py-1.5 rounded-lg hover:bg-ink-soft transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate text-sm">
                    No resident records found matching "{searchTerm}".
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

