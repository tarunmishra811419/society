import { useState, useEffect } from "react";
import { PageHeader, Card, StatTile } from "../../components/UI";
import { api } from "../../api/client";
import {
  AlertTriangle,
  Bell,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Send,
  X,
  Users,
  Sparkles,
} from "lucide-react";

export default function Defaulters() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [sendingId, setSendingId] = useState(null);
  const [sendingAll, setSendingAll] = useState(false);

  // Generate Monthly Bills Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genPeriod, setGenPeriod] = useState("October 2026");
  const [genAmount, setGenAmount] = useState("3200");
  const [genDueDate, setGenDueDate] = useState("2026-10-15");
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/billing/fees/");
      setFees(data.results.filter((f) => f.status !== "paid"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }

  async function handleSendReminder(fee) {
    setSendingId(fee.id);
    try {
      await api.post(`/billing/fees/${fee.id}/remind/`);
      showToast(`Reminder sent to ${fee.resident_name} (Flat ${fee.flat}) via in-app & SMS.`);
      await load();
    } catch (err) {
      setError(err.message || "Failed to dispatch reminder.");
    } finally {
      setSendingId(null);
    }
  }

  async function handleSendAllReminders() {
    if (!window.confirm(`Are you sure you want to dispatch payment follow-up reminders to all ${fees.length} outstanding flats?`)) {
      return;
    }
    setSendingAll(true);
    try {
      const res = await api.post("/billing/fees/remind-all/");
      showToast(`Dispatched payment follow-up nudges to ${res.count} flats.`);
      await load();
    } catch (err) {
      setError(err.message || "Failed to dispatch bulk reminders.");
    } finally {
      setSendingAll(false);
    }
  }

  async function handleGenerateBills(e) {
    e.preventDefault();
    setGenLoading(true);
    try {
      const res = await api.post("/billing/fees/generate-monthly/", {
        period: genPeriod.trim(),
        amount: parseFloat(genAmount),
        due_date: genDueDate || null,
      });
      setShowGenModal(false);
      showToast(
        `Generated ${res.created_count} new bills for ${res.period} (${res.existing_count} already existed).`
      );
      await load();
    } catch (err) {
      setError(err.message || "Failed to generate monthly bills.");
    } finally {
      setGenLoading(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading defaulter records…</div>;
  }

  const totalDue = fees.reduce((sum, f) => sum + Number(f.amount), 0);
  const flatsWithDues = new Set(fees.map((f) => f.flat)).size;
  const overdueCount = fees.filter((f) => f.status === "overdue").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Maintenance Collections"
        title="Defaulters & Follow-ups"
        actions={
          <div className="flex gap-2.5">
            <button
              onClick={() => setShowGenModal(true)}
              className="flex items-center gap-2 bg-paper border border-line text-ink text-xs font-semibold px-4 py-2 rounded-xl hover:bg-mist transition-colors shadow-xs cursor-pointer"
            >
              <CalendarPlus size={14} className="text-amber" />
              Generate Monthly Bills
            </button>
            <button
              onClick={handleSendAllReminders}
              disabled={sendingAll || fees.length === 0}
              className="flex items-center gap-2 bg-ink text-paper text-xs font-semibold px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Bell size={14} className="text-amber" />
              {sendingAll ? "Sending Nudges…" : `Nudge All (${fees.length})`}
            </button>
          </div>
        }
      />

      {toast && (
        <div className="flex items-center gap-2 text-sm text-green bg-green-soft/30 border border-green/30 rounded-xl px-4 py-3 animate-fade-in shadow-xs">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-rust bg-rust-soft/20 border border-rust/30 rounded-xl px-4 py-3 animate-fade-in">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatTile label="Total Outstanding Dues" value={`₹${totalDue.toLocaleString()}`} />
        <StatTile label="Flats with Pending Dues" value={flatsWithDues} />
        <StatTile
          label="Severely Overdue (>30 Days)"
          value={overdueCount}
          sub="Requires urgent automated follow-up"
        />
      </div>

      {/* Defaulter Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="font-display font-semibold text-ink flex items-center gap-2">
            <Users size={18} className="text-amber" />
            Outstanding Balances by Resident & Flat
          </div>
          <span className="text-xs font-mono text-slate">{fees.length} Pending Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wider text-slate border-b border-line bg-mist/50">
                <th className="px-6 py-3.5 font-medium">Flat</th>
                <th className="px-6 py-3.5 font-medium">Resident</th>
                <th className="px-6 py-3.5 font-medium">Billing Period</th>
                <th className="px-6 py-3.5 font-medium">Amount</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium">Last Reminded</th>
                <th className="px-6 py-3.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {fees.map((f) => (
                <tr key={f.id} className="hover:bg-mist/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-ink">{f.flat}</td>
                  <td className="px-6 py-4 font-medium text-ink">
                    <div>{f.resident_name}</div>
                    {f.phone && <div className="text-xs font-mono text-slate">{f.phone}</div>}
                  </td>
                  <td className="px-6 py-4 text-slate">{f.period}</td>
                  <td className="px-6 py-4 font-mono font-semibold text-ink">
                    ₹{Number(f.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium font-mono ${
                        f.status === "overdue"
                          ? "bg-rust text-paper"
                          : "bg-amber-soft text-ink border border-amber/30"
                      }`}
                    >
                      {f.status === "overdue" && <AlertTriangle size={12} />}
                      {f.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate">
                    {f.last_reminder_sent ? (
                      <div>
                        <span>{new Date(f.last_reminder_sent).toLocaleDateString()}</span>
                        <span className="block text-[10px] text-amber">
                          ({f.reminder_count} {f.reminder_count === 1 ? "nudge" : "nudges"})
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate/60">Not reminded</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSendReminder(f)}
                      disabled={sendingId === f.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink bg-mist border border-line px-3 py-1.5 rounded-lg hover:bg-amber-soft hover:border-amber/40 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send size={12} className={sendingId === f.id ? "animate-pulse" : "text-amber"} />
                      {sendingId === f.id ? "Sending…" : "Send Nudge"}
                    </button>
                  </td>
                </tr>
              ))}
              {fees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate text-sm">
                    <CheckCircle2 size={32} className="mx-auto text-green mb-2 opacity-80" />
                    All flats are up to date with zero outstanding maintenance dues!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* =========================================================================
          MODAL: GENERATE MONTHLY MAINTENANCE BILLS IN BATCH
         ========================================================================= */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-paper border border-line rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-mist/40">
              <div className="flex items-center gap-2">
                <CalendarPlus size={18} className="text-amber" />
                <h3 className="font-display font-semibold text-ink">Generate Monthly Bills</h3>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-slate hover:text-ink p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateBills} className="p-6 space-y-4">
              <p className="text-xs text-slate">
                This will automatically generate maintenance invoices with itemized breakdowns for all registered residents in the society.
              </p>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate mb-1.5">
                  Billing Period
                </label>
                <input
                  type="text"
                  required
                  value={genPeriod}
                  onChange={(e) => setGenPeriod(e.target.value)}
                  placeholder="e.g. October 2026"
                  className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm focus-visible:outline-amber bg-mist/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate mb-1.5">
                    Standard Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="50"
                    value={genAmount}
                    onChange={(e) => setGenAmount(e.target.value)}
                    className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm font-mono focus-visible:outline-amber bg-mist/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={genDueDate}
                    onChange={(e) => setGenDueDate(e.target.value)}
                    className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm font-mono focus-visible:outline-amber bg-mist/20"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber/10 border border-amber/20 rounded-xl text-xs text-slate">
                <span className="font-semibold text-ink">Breakdown applied:</span> 75% Base Maintenance, 10% Water, 8% Sinking Fund, 7% Common Electricity.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="flex-1 border border-line text-sm text-slate hover:text-ink font-medium py-2.5 rounded-xl hover:bg-mist transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={genLoading}
                  className="flex-1 bg-ink text-paper text-sm font-semibold py-2.5 rounded-xl hover:bg-ink-soft transition-colors shadow-md shadow-ink/10 cursor-pointer disabled:opacity-60"
                >
                  {genLoading ? "Generating…" : "Generate Invoices"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}