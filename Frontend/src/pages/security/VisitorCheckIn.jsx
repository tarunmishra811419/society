import { useState, useEffect, useCallback, useRef } from "react";
import { PageHeader, Card } from "../../components/UI";
import { api } from "../../api/client";
import {
  Hash, QrCode, Check, X, LogOut, Clock, AlertTriangle,
  RefreshCw, Users, ChevronRight, Wifi
} from "lucide-react";

const GATES = ["Main Gate", "Back Gate", "Service Gate"];

/* ── Numeric keypad ─────────────────────────────────────── */
function OTPKeypad({ value, onChange, onSubmit, submitting }) {
  function press(d) {
    if (value.length < 4) onChange(value + d);
  }
  function del() {
    onChange(value.slice(0, -1));
  }

  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* OTP display */}
      <div className="flex justify-center gap-3 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-14 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-display font-bold transition-all ${
              value[i] ? "border-amber bg-amber/10 text-ink scale-105" : "border-line bg-paper/50 text-line"
            }`}
          >
            {value[i] || "·"}
          </div>
        ))}
      </div>
      {/* keypad grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {digits.map((d, i) => {
          if (d === "") return <div key={i} />;
          if (d === "⌫") return (
            <button
              key={i}
              type="button"
              onClick={del}
              className="h-12 rounded-xl border border-line text-slate hover:bg-line/50 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          );
          return (
            <button
              key={i}
              type="button"
              onClick={() => press(d)}
              className="h-12 rounded-xl border border-line font-display font-semibold text-lg hover:bg-amber-soft hover:border-amber transition-all active:scale-95"
            >
              {d}
            </button>
          );
        })}
      </div>
      <button
        onClick={onSubmit}
        disabled={submitting || value.length !== 4}
        className="w-full bg-ink text-paper font-semibold py-3 rounded-xl hover:bg-ink-soft transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
      >
        <Check size={18} /> {submitting ? "Checking in…" : "Check In"}
      </button>
    </div>
  );
}

/* ── Stay duration helper ───────────────────────────────── */
function StayDuration({ checkedInAt }) {
  const [mins, setMins] = useState(0);
  useEffect(() => {
    function calc() {
      const diff = Math.floor((Date.now() - new Date(checkedInAt)) / 60000);
      setMins(diff);
    }
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [checkedInAt]);

  if (mins < 60) return <span>{mins}m</span>;
  const h = Math.floor(mins / 60), m = mins % 60;
  return <span>{h}h {m}m</span>;
}

export default function VisitorCheckIn() {
  const [mode, setMode] = useState("otp"); // "otp" | "code"
  const [otp, setOtp] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [gate, setGate] = useState(GATES[0]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [insideList, setInsideList] = useState([]);
  const [loadingInside, setLoadingInside] = useState(true);
  const codeRef = useRef(null);

  const loadInside = useCallback(async () => {
    setLoadingInside(true);
    try {
      const data = await api.get("/visitors/passes/active-inside/");
      setInsideList(data.results ?? data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoadingInside(false);
    }
  }, []);

  useEffect(() => {
    loadInside();
    const id = setInterval(loadInside, 30000); // refresh every 30s
    return () => clearInterval(id);
  }, [loadInside]);

  async function doCheckIn(code) {
    setSubmitting(true);
    setResult(null);
    try {
      const visitor = await api.post("/visitors/check-in/", { code, gate });
      setResult({ ok: true, visitor });
      setOtp("");
      setCodeInput("");
      await loadInside();
    } catch (err) {
      setResult({ ok: false, message: err.message });
      setOtp("");
    } finally {
      setSubmitting(false);
    }
  }

  async function checkOut(visitorId) {
    try {
      await api.post(`/visitors/passes/${visitorId}/check-out/`);
      await loadInside();
    } catch (err) {
      alert(err.message);
    }
  }

  // auto-submit when OTP reaches 4 digits
  useEffect(() => {
    if (otp.length === 4 && mode === "otp") {
      doCheckIn(otp);
    }
  }, [otp]);

  const overstayCount = insideList.filter((v) => (v.stay_duration_minutes || 0) > 240).length;

  return (
    <div>
      <PageHeader eyebrow="Gate" title="Visitor check-in" />

      {/* Gate selector */}
      <div className="flex gap-2 mb-6">
        {GATES.map((g) => (
          <button
            key={g}
            onClick={() => setGate(g)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              gate === g
                ? "bg-ink text-paper"
                : "border border-line text-slate hover:border-ink hover:text-ink"
            }`}
          >
            {g}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green font-mono">
          <Wifi size={12} className="animate-pulse" /> Live
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* ── Check-in panel ── */}
        <Card className="p-6">
          {/* Mode tabs */}
          <div className="flex rounded-xl border border-line overflow-hidden mb-6">
            <button
              onClick={() => { setMode("otp"); setResult(null); }}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                mode === "otp" ? "bg-ink text-paper" : "text-slate hover:bg-line/50"
              }`}
            >
              <Hash size={14} /> OTP Entry
            </button>
            <button
              onClick={() => { setMode("code"); setResult(null); setTimeout(() => codeRef.current?.focus(), 50); }}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                mode === "code" ? "bg-ink text-paper" : "text-slate hover:bg-line/50"
              }`}
            >
              <QrCode size={14} /> QR / Code
            </button>
          </div>

          {mode === "otp" && (
            <OTPKeypad
              value={otp}
              onChange={setOtp}
              onSubmit={() => doCheckIn(otp)}
              submitting={submitting}
            />
          )}

          {mode === "code" && (
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wide text-slate">
                QR code / phone number
              </label>
              <input
                ref={codeRef}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doCheckIn(codeInput.trim())}
                placeholder="QR-8891 or +91 98765..."
                className="w-full border border-line rounded-xl px-4 py-3 text-sm font-mono focus-visible:outline-amber"
              />
              <button
                onClick={() => doCheckIn(codeInput.trim())}
                disabled={submitting || !codeInput.trim()}
                className="w-full bg-ink text-paper font-semibold py-3 rounded-xl hover:bg-ink-soft transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Check size={18} /> {submitting ? "Checking in…" : "Check In"}
              </button>
            </div>
          )}

          {/* Result feedback */}
          {result && (
            <div className={`mt-4 rounded-xl p-4 flex items-start gap-3 animate-scale-in ${
              result.ok ? "bg-green/10 border border-green/30" : "bg-rust/10 border border-rust/30"
            }`}>
              {result.ok
                ? <Check size={18} className="text-green shrink-0 mt-0.5" />
                : <X size={18} className="text-rust shrink-0 mt-0.5" />}
              <div>
                {result.ok ? (
                  <>
                    <div className="font-semibold text-sm text-green">{result.visitor.name} checked in</div>
                    <div className="text-xs text-slate mt-0.5">
                      Host: {result.visitor.host_flat} · Gate: {gate}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-rust">{result.message}</div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* ── Occupancy summary ── */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-display font-semibold flex items-center gap-2">
                <Users size={16} /> Campus occupancy
              </div>
              <button onClick={loadInside} className="text-slate hover:text-ink transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="text-4xl font-display font-bold mb-1">
              {insideList.length}
            </div>
            <div className="text-xs text-slate mb-3">visitors currently inside</div>

            {/* occupancy bar */}
            <div className="h-2 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-amber rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, insideList.length * 5)}%` }}
              />
            </div>

            {overstayCount > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber font-medium">
                <AlertTriangle size={13} />
                {overstayCount} visitor{overstayCount > 1 ? "s" : ""} with extended stay (&gt;4h)
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="text-xs font-mono uppercase tracking-wide text-slate mb-3">Tip</div>
            <p className="text-xs text-slate leading-relaxed">
              Visitor can share their <strong className="text-ink">4-digit OTP</strong> verbally, or
              show the <strong className="text-ink">QR code</strong> from their host's message.
              Both work at any gate.
            </p>
          </Card>
        </div>
      </div>

      {/* ── Inside Campus Now ── */}
      <Card>
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div className="font-display font-semibold">Inside society now</div>
          <div className="text-xs font-mono text-slate">{insideList.length} visitors</div>
        </div>
        {loadingInside ? (
          <div className="p-8 text-center text-sm text-slate">Loading…</div>
        ) : insideList.length === 0 ? (
          <div className="p-10 text-center text-slate text-sm">No visitors inside right now.</div>
        ) : (
          <div className="divide-y divide-line">
            {insideList.map((v) => {
              const overstay = (v.stay_duration_minutes || 0) > 240;
              return (
                <div key={v.id} className="px-5 py-3.5 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      overstay ? "bg-amber/20 text-amber" : "bg-green/10 text-green"
                    }`}>
                      {v.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {v.name}
                        {overstay && (
                          <span className="text-xs bg-amber/15 text-amber px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <AlertTriangle size={10} /> Extended stay
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate">
                        Host: {v.host_flat}
                        {v.checked_in_at && (
                          <span className="ml-2 font-mono">
                            · in for <StayDuration checkedInAt={v.checked_in_at} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono text-slate">
                      {v.checked_in_at && new Date(v.checked_in_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                    <button
                      onClick={() => checkOut(v.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate hover:text-rust border border-line hover:border-rust px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <LogOut size={12} /> Check out
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}