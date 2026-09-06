import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import { QrCode, ScanLine, Check } from "lucide-react";

export default function VisitorCheckIn() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/visitors/passes/");
      setVisitors(data.results);
    } catch {
      // silently retry on next check-in
    } finally {
      setLoading(false);
    }
  }

  async function handleScan(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const visitor = await api.post("/visitors/check-in/", { qr_code: code.trim() });
      setResult({ ok: true, message: `${visitor.name} checked in → host ${visitor.host_flat} notified.` });
      setCode("");
      await load();
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Gate" title="Visitor QR check-in" />

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-lg bg-amber-soft flex items-center justify-center text-ink shrink-0">
            <ScanLine size={22} />
          </div>
          <div>
            <div className="font-display font-semibold">Scan or enter QR code</div>
            <p className="text-xs text-slate">
              Enter the code from a resident-approved pass.
            </p>
          </div>
        </div>

        <form onSubmit={handleScan} className="flex gap-3">
          <input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="QR-XXXX"
            className="flex-1 border border-line rounded-lg px-3 py-2.5 text-sm font-mono focus-visible:outline-amber"
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-ink text-paper text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            <QrCode size={16} /> {submitting ? "Checking…" : "Check in"}
          </button>
        </form>

        {result && (
          <div
            className={`mt-4 flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg ${
              result.ok ? "bg-green-soft text-green" : "bg-rust-soft text-rust"
            }`}
          >
            {result.ok && <Check size={16} />}
            {result.message}
          </div>
        )}
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-line font-display font-semibold">
          Active passes
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
                <th className="px-5 py-3 font-medium">QR code</th>
                <th className="px-5 py-3 font-medium">Visitor</th>
                <th className="px-5 py-3 font-medium">Host</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-mono">{v.qr_code}</td>
                  <td className="px-5 py-3">{v.name}</td>
                  <td className="px-5 py-3 font-mono">{v.host_flat}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={v.status.replace(/_/g, "-")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}