import { useState, useEffect } from "react";
import { PageHeader, Card, StatTile } from "../../components/UI";
import { api } from "../../api/client";
import { AlertTriangle } from "lucide-react";

export default function Defaulters() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-slate p-8 text-center">Loading…</div>;
  }
  if (error) {
    return <div className="text-sm text-rust p-8 text-center">{error}</div>;
  }

  const totalDue = fees.reduce((sum, f) => sum + Number(f.amount), 0);
  const flatsWithDues = new Set(fees.map((f) => f.flat)).size;
  const overdueCount = fees.filter((f) => f.status === "overdue").length;

  return (
    <div>
      <PageHeader eyebrow="Maintenance" title="Defaulter tracking" />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatTile label="Total outstanding" value={`₹${totalDue.toLocaleString()}`} />
        <StatTile label="Flats with dues" value={flatsWithDues} />
        <StatTile label="Overdue (past due date)" value={overdueCount} sub="Needs follow-up" />
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-line font-display font-semibold">
          Outstanding by flat
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-xs uppercase tracking-wide text-slate border-b border-line">
              <th className="px-5 py-3 font-medium">Flat</th>
              <th className="px-5 py-3 font-medium">Resident</th>
              <th className="px-5 py-3 font-medium">Period</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <td className="px-5 py-3 font-mono font-medium">{f.flat}</td>
                <td className="px-5 py-3">{f.resident_name}</td>
                <td className="px-5 py-3 text-slate">{f.period}</td>
                <td className="px-5 py-3 font-mono">₹{Number(f.amount).toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium font-mono ${
                      f.status === "overdue" ? "bg-rust text-paper" : "bg-amber-soft text-ink"
                    }`}
                  >
                    {f.status === "overdue" && <AlertTriangle size={12} />}
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate text-sm">
                  No outstanding fees — everyone's paid up.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}