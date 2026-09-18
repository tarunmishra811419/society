import { useState, useEffect, useCallback } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import {
  Plus, X, Copy, CheckCircle2, Clock, Car, Phone,
  CalendarDays, User, QrCode, Shield, ChevronRight
} from "lucide-react";

const STATUS_FLOW = {
  APPROVED: { label: "Approved", color: "text-amber bg-amber/10", icon: Shield },
  CHECKED_IN: { label: "Inside Campus", color: "text-green bg-green/10", icon: CheckCircle2 },
  CHECKED_OUT: { label: "Departed", color: "text-slate bg-line", icon: Clock },
  PENDING: { label: "Pending", color: "text-ink bg-ink/5", icon: Clock },
  EXPIRED: { label: "Expired", color: "text-rust bg-rust/10", icon: X },
};

function PassCard({ pass, approval }) {
  const [copied, setCopied] = useState(false);

  const visitorStatus = pass?.status || approval?.status || "PENDING";
  const meta = STATUS_FLOW[visitorStatus] || STATUS_FLOW["PENDING"];
  const Icon = meta.icon;

  function copyPass() {
    const host = approval?.host_flat || pass?.host_flat || "your flat";
    const otp = pass?.otp || "—";
    const name = approval?.visitor_name || pass?.name;
    const date = approval?.expected_date
      ? new Date(approval.expected_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : "today";
    const text = `🏠 Residentia Gate Pass\nGuest: ${name}\nOTP: ${otp}\nExpected: ${date}\nHost: ${host}\nShow this OTP at gate for entry.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-ink to-ink-soft text-paper p-6 shadow-2xl">
      {/* decorative circle */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber/10 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-paper/5 pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-paper/50 mb-1">Residentia · Digital Gate Pass</div>
          <div className="text-xl font-display font-bold">{approval?.visitor_name || pass?.name}</div>
          {(approval?.purpose || pass?.purpose) && (
            <div className="text-sm text-paper/60 mt-0.5">{approval?.purpose || pass?.purpose}</div>
          )}
        </div>
        {pass?.qr_image && (
          <img src={pass.qr_image} alt="QR" className="w-16 h-16 rounded-xl border-2 border-paper/20 bg-paper p-0.5" />
        )}
        {!pass?.qr_image && (
          <div className="w-16 h-16 rounded-xl border-2 border-paper/20 bg-paper/10 flex items-center justify-center">
            <QrCode size={28} className="text-paper/40" />
          </div>
        )}
      </div>

      {/* OTP display */}
      {pass?.otp && (
        <div className="mb-4">
          <div className="text-xs font-mono uppercase tracking-widest text-paper/50 mb-2">Gate OTP</div>
          <div className="flex gap-2">
            {String(pass.otp).split("").map((d, i) => (
              <div
                key={i}
                className="w-12 h-14 rounded-xl bg-amber text-ink text-2xl font-display font-bold flex items-center justify-center shadow-lg"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="text-xs text-paper/50 mt-2 font-mono">Show OTP or QR at main gate</div>
        </div>
      )}

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        {(approval?.expected_date || pass?.expected_date) && (
          <div className="flex items-center gap-2 bg-paper/10 rounded-lg px-3 py-2">
            <CalendarDays size={13} className="text-paper/60" />
            <span className="text-paper/80">
              {new Date(approval?.expected_date || pass?.expected_date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </span>
          </div>
        )}
        {(approval?.phone || pass?.phone) && (
          <div className="flex items-center gap-2 bg-paper/10 rounded-lg px-3 py-2">
            <Phone size={13} className="text-paper/60" />
            <span className="text-paper/80">{approval?.phone || pass?.phone}</span>
          </div>
        )}
        {(approval?.vehicle_number || pass?.vehicle_number) && (
          <div className="flex items-center gap-2 bg-paper/10 rounded-lg px-3 py-2">
            <Car size={13} className="text-paper/60" />
            <span className="text-paper/80 font-mono">{approval?.vehicle_number || pass?.vehicle_number}</span>
          </div>
        )}
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${meta.color}`}>
          <Icon size={13} />
          <span className="font-medium">{meta.label}</span>
        </div>
      </div>

      {pass?.otp && (
        <button
          onClick={copyPass}
          className="w-full flex items-center justify-center gap-2 bg-paper/10 hover:bg-paper/20 border border-paper/20 rounded-xl py-2.5 text-sm font-medium transition-all"
        >
          {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
          {copied ? "Copied to clipboard!" : "Copy pass to share"}
        </button>
      )}
    </div>
  );
}

export default function GuestApproval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);

  // form state
  const [form, setForm] = useState({
    visitor_name: "", phone: "", vehicle_number: "", purpose: "", expected_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [newPass, setNewPass] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/visitors/guest-approvals/");
      setRequests(data.results ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function addRequest(e) {
    e.preventDefault();
    if (!form.visitor_name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        visitor_name: form.visitor_name,
        purpose: form.purpose || "Guest visit",
        ...(form.phone && { phone: form.phone }),
        ...(form.vehicle_number && { vehicle_number: form.vehicle_number.toUpperCase() }),
        ...(form.expected_date && { expected_date: form.expected_date }),
      };
      const result = await api.post("/visitors/guest-approvals/", payload);
      setNewPass(result);
      setForm({ visitor_name: "", phone: "", vehicle_number: "", purpose: "", expected_date: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <PageHeader
        eyebrow="Guests"
        title="Guest pre-approval"
        action={
          <button
            onClick={() => { setShowForm((s) => !s); setNewPass(null); }}
            className="flex items-center gap-1.5 bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors"
          >
            <Plus size={16} /> Pre-approve a guest
          </button>
        }
      />

      {/* New-pass card shown immediately after creation */}
      {newPass && (
        <div className="mb-6 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-green flex items-center gap-2">
              <CheckCircle2 size={16} /> Gate pass created — share with your guest
            </div>
            <button onClick={() => setNewPass(null)} className="text-slate hover:text-ink">
              <X size={16} />
            </button>
          </div>
          <PassCard pass={newPass.visitor_pass} approval={newPass} />
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <Card className="p-5 mb-6 animate-scale-in">
          <div className="font-display font-semibold mb-4">New guest pre-approval</div>
          <form onSubmit={addRequest} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  <User size={11} className="inline mr-1" /> Guest name *
                </label>
                <input
                  autoFocus
                  value={form.visitor_name}
                  onChange={(e) => setField("visitor_name", e.target.value)}
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  <Phone size={11} className="inline mr-1" /> Guest phone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
                  placeholder="+91 98765 43210"
                  type="tel"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  Purpose of visit
                </label>
                <input
                  value={form.purpose}
                  onChange={(e) => setField("purpose", e.target.value)}
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
                  placeholder="e.g. Family visit, Birthday party"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  <CalendarDays size={11} className="inline mr-1" /> Expected date
                </label>
                <input
                  type="date"
                  value={form.expected_date}
                  min={today}
                  onChange={(e) => setField("expected_date", e.target.value)}
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-visible:outline-amber"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                  <Car size={11} className="inline mr-1" /> Vehicle number (optional)
                </label>
                <input
                  value={form.vehicle_number}
                  onChange={(e) => setField("vehicle_number", e.target.value)}
                  className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono focus-visible:outline-amber"
                  placeholder="MH 01 AB 1234"
                />
              </div>
            </div>
            {error && <p className="text-xs text-rust">{error}</p>}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-amber text-ink text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60"
              >
                {submitting ? "Generating pass…" : "Generate gate pass & OTP"}
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

      {/* Pass detail modal */}
      {selectedPass && (
        <div
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPass(null)}
        >
          <div className="max-w-sm w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button onClick={() => setSelectedPass(null)} className="text-paper/70 hover:text-paper">
                <X size={20} />
              </button>
            </div>
            <PassCard pass={selectedPass.visitor_pass} approval={selectedPass} />
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="px-5 py-4 border-b border-line font-display font-semibold flex items-center justify-between">
          <span>Your guest requests</span>
          <span className="text-xs font-mono text-slate">{requests.length} total</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading…</div>
        ) : (
          <div className="divide-y divide-line">
            {requests.map((r) => {
              const meta = STATUS_FLOW[r.status?.toUpperCase()] || STATUS_FLOW["PENDING"];
              const Icon = meta.icon;
              return (
                <div
                  key={r.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-line/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedPass(r)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-soft flex items-center justify-center text-ink shrink-0">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{r.visitor_name}</div>
                      <div className="text-xs text-slate">
                        {r.purpose}
                        {r.expected_date && (
                          <span className="ml-2 font-mono">
                            · {new Date(r.expected_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${meta.color}`}>
                      <Icon size={11} /> {meta.label}
                    </span>
                    {r.visitor_pass?.otp && (
                      <span className="font-mono text-xs bg-ink text-paper px-2 py-1 rounded-md tracking-widest">
                        {r.visitor_pass.otp}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-slate group-hover:text-ink transition-colors" />
                  </div>
                </div>
              );
            })}
            {requests.length === 0 && (
              <div className="px-5 py-10 text-center text-slate text-sm">
                No guest requests yet. Pre-approve a guest above to generate a gate pass with OTP.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}