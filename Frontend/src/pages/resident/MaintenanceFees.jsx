import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";

export default function MaintenanceFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get("/billing/fees/");
      setFees(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePay(fee) {
    setPaying(fee.id);
    setError("");
    try {
      // Step 1: create the order (this is what the real gateway checkout
      // widget would use in production).
      const order = await api.post(`/billing/fees/${fee.id}/pay/`);

      // Step 2: in test mode, we simulate the gateway's own confirmation
      // by calling the webhook ourselves — in production this call comes
      // from the payment gateway's servers, never from the browser.
      await api.post("/billing/webhook/", {
        fee_id: fee.id,
        order_id: order.order_id,
        status: "success",
      });

      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(null);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading fees…</div>;
  }

  const due = fees.filter((f) => f.status === "due");

  return (
    <div>
      <PageHeader eyebrow="Maintenance" title="Fee tracking" />

      {error && (
        <div className="text-sm text-rust bg-rust-soft/20 border border-rust/30 rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {due.length > 0 && (
        <Card className="p-5 mb-6 border-amber/40 bg-amber-soft/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display font-semibold">
                ₹{Number(due[0].amount).toLocaleString()} due for {due[0].period}
              </div>
              <div className="text-xs text-slate mt-1">Payment runs in test mode — no real charge.</div>
            </div>
            <button
              onClick={() => handlePay(due[0])}
              disabled={paying === due[0].id}
              className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors disabled:opacity-60"
            >
              {paying === due[0].id ? "Processing…" : "Pay now (test mode)"}
            </button>
          </div>
        </Card>
      )}

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
              <th className="px-5 py-3 font-medium">Period</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Paid on</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.id} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-medium">{f.period}</td>
                <td className="px-5 py-3 font-mono">₹{Number(f.amount).toLocaleString()}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={f.status} />
                </td>
                <td className="px-5 py-3 text-slate">
                  {f.paid_on ? new Date(f.paid_on).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}