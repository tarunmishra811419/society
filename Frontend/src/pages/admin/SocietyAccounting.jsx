import { useState, useEffect } from "react";
import { PageHeader, Card, StatTile } from "../../components/UI";
import { api } from "../../api/client";
import {
  Landmark,
  PlusCircle,
  Download,
  Printer,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
} from "lucide-react";

export default function SocietyAccounting() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    reserve_fund: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Filters
  const [filterType, setFilterType] = useState("all"); // all, income, expense
  const [searchQuery, setSearchQuery] = useState("");

  // New Transaction Modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("expense"); // expense or income
  const [formData, setFormData] = useState({
    category: "utilities",
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    reference_no: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [txRes, sumRes] = await Promise.all([
        api.get("/billing/transactions/"),
        api.get("/billing/transactions/summary/"),
      ]);
      setTransactions(txRes.results || txRes);
      setSummary(sumRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showNotification(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }

  async function handleCreateTransaction(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post("/billing/transactions/", {
        entry_type: modalType,
        category: formData.category,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        date: formData.date,
        reference_no: formData.reference_no.trim() || `TXN-${Date.now().toString().slice(-5)}`,
        description: formData.description.trim(),
      });

      setShowModal(false);
      setFormData({
        category: "utilities",
        title: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        reference_no: "",
        description: "",
      });
      showNotification(`Recorded ${modalType === "income" ? "income receipt" : "expense voucher"} successfully.`);
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to record transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  function exportCSV() {
    const headers = ["Date", "Type", "Category", "Title", "Amount (INR)", "Reference No", "Recorded By", "Description"];
    const rows = transactions.map((t) => [
      t.date,
      t.entry_type.toUpperCase(),
      t.category,
      `"${t.title.replace(/"/g, '""')}"`,
      t.amount,
      t.reference_no || "",
      t.recorded_by_name || "System",
      `"${(t.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Residentia_Society_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Financial ledger CSV exported successfully.");
  }

  // Filter items
  const filtered = transactions.filter((t) => {
    if (filterType !== "all" && t.entry_type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.reference_no && t.reference_no.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financial Accounting"
        title="Society Cash Book & Ledger"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 text-xs font-semibold bg-paper border border-line text-ink px-3.5 py-2 rounded-xl hover:bg-mist transition-colors shadow-xs cursor-pointer"
            >
              <FileSpreadsheet size={14} className="text-amber" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs font-semibold bg-paper border border-line text-ink px-3.5 py-2 rounded-xl hover:bg-mist transition-colors shadow-xs cursor-pointer print:hidden"
            >
              <Printer size={14} />
              Print Report
            </button>
            <button
              onClick={() => {
                setModalType("expense");
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-ink text-paper px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors shadow-md shadow-ink/10 cursor-pointer"
            >
              <PlusCircle size={14} className="text-amber" />
              Record Entry
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
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Accounting KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatTile
          label="Total Collections (Inflow)"
          value={`₹${summary.total_income.toLocaleString()}`}
          sub="Maintenance & Facility Rents"
        />
        <StatTile
          label="Total Society Expenses"
          value={`₹${summary.total_expenses.toLocaleString()}`}
          sub="Salaries, Utilities, Maintenance & Repairs"
        />
        <StatTile
          label="Net Society Reserve Balance"
          value={`₹${summary.reserve_fund.toLocaleString()}`}
          sub="Surplus reserve funds in society account"
        />
      </div>

      {/* Controls & Search Strip */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tab Filter */}
          <div className="flex p-1 bg-mist border border-line rounded-xl w-fit">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterType === "all" ? "bg-paper text-ink font-semibold shadow-xs" : "text-slate hover:text-ink"
              }`}
            >
              All Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType("income")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterType === "income" ? "bg-paper text-green font-semibold shadow-xs" : "text-slate hover:text-ink"
              }`}
            >
              Incomes Only
            </button>
            <button
              onClick={() => setFilterType("expense")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterType === "expense" ? "bg-paper text-rust font-semibold shadow-xs" : "text-slate hover:text-ink"
              }`}
            >
              Expenses Only
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
            <input
              type="text"
              placeholder="Search description, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-line rounded-xl focus-visible:outline-amber bg-mist/20"
            />
          </div>
        </div>
      </Card>

      {/* Ledger Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="font-display font-semibold text-ink flex items-center gap-2">
            <Landmark size={18} className="text-amber" />
            General Ledger Entries
          </div>
          <span className="text-xs font-mono text-slate">{filtered.length} Displayed</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate">Loading accounting records…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-xs uppercase tracking-wider text-slate border-b border-line bg-mist/50">
                  <th className="px-6 py-3.5 font-medium">Date</th>
                  <th className="px-6 py-3.5 font-medium">Type</th>
                  <th className="px-6 py-3.5 font-medium">Category</th>
                  <th className="px-6 py-3.5 font-medium">Particulars & Description</th>
                  <th className="px-6 py-3.5 font-medium">Ref No.</th>
                  <th className="px-6 py-3.5 font-medium text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-mist/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate whitespace-nowrap">
                      {t.date}
                    </td>
                    <td className="px-6 py-4">
                      {t.entry_type === "income" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-green-soft text-green border border-green/30">
                          <ArrowDownLeft size={12} /> INFLOW
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-rust-soft text-rust border border-rust/30">
                          <ArrowUpRight size={12} /> OUTFLOW
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate uppercase">
                      {t.category.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-ink">{t.title}</div>
                      {t.description && (
                        <div className="text-xs text-slate truncate max-w-xs">{t.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate">{t.reference_no || "—"}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold whitespace-nowrap">
                      <span className={t.entry_type === "income" ? "text-green" : "text-rust"}>
                        {t.entry_type === "income" ? "+" : "-"}₹{Number(t.amount).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate text-sm">
                      No transactions matched the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* =========================================================================
          MODAL: RECORD EXPENSE OR INCOME VOUCHER
         ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-paper border border-line rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-mist/40">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-amber" />
                <h3 className="font-display font-semibold text-ink">Record Society Transaction</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate hover:text-ink p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-mist border border-line rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setModalType("expense");
                    setFormData({ ...formData, category: "utilities" });
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    modalType === "expense"
                      ? "bg-rust text-paper shadow-xs"
                      : "text-slate hover:text-ink"
                  }`}
                >
                  Expense / Outflow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalType("income");
                    setFormData({ ...formData, category: "maintenance" });
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    modalType === "income"
                      ? "bg-green text-paper shadow-xs"
                      : "text-slate hover:text-ink"
                  }`}
                >
                  Income / Inflow
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate mb-1.5">
                  Accounting Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm focus-visible:outline-amber bg-mist/20"
                >
                  {modalType === "expense" ? (
                    <>
                      <option value="security">Security Staff & Guards</option>
                      <option value="housekeeping">Housekeeping & Sanitation</option>
                      <option value="utilities">Electricity & Water Bills</option>
                      <option value="repairs">Lift & Electrical Repairs</option>
                      <option value="gardening">Landscaping & Gardening</option>
                      <option value="admin">Administrative & Audit Fees</option>
                      <option value="other_expense">Other Society Expense</option>
                    </>
                  ) : (
                    <>
                      <option value="maintenance">Maintenance Collection</option>
                      <option value="facility">Facility / Hall Booking</option>
                      <option value="penalty">Late Fees & Penalties</option>
                      <option value="other_income">Other Society Income</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate mb-1.5">
                  Transaction Title / Payee
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BESCOM Electricity Bill for September"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm focus-visible:outline-amber bg-mist/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate mb-1.5">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 15000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm font-mono focus-visible:outline-amber bg-mist/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm font-mono focus-visible:outline-amber bg-mist/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate mb-1.5">
                  Voucher / Invoice Reference No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-9901 (optional)"
                  value={formData.reference_no}
                  onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                  className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm font-mono focus-visible:outline-amber bg-mist/20"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate mb-1.5">
                  Detailed Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional explanatory notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus-visible:outline-amber bg-mist/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-line text-sm text-slate hover:text-ink font-medium py-2.5 rounded-xl hover:bg-mist transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-ink text-paper text-sm font-semibold py-2.5 rounded-xl hover:bg-ink-soft transition-colors shadow-md shadow-ink/10 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Record in Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

