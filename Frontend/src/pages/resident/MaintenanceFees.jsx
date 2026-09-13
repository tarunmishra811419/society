import { useState, useEffect } from "react";
import { PageHeader, Card, StatusBadge } from "../../components/UI";
import { api } from "../../api/client";
import {
  CreditCard,
  QrCode,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Printer,
  X,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function MaintenanceFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Payment Modal State
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi"); // upi, card, net_banking
  const [upiId, setUpiId] = useState("ritika@okaxis");
  const [cardData, setCardData] = useState({
    number: "4532 8921 0045 7712",
    name: "Ritika Sharma",
    expiry: "09/28",
    cvv: "882",
  });
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0); // 0: idle, 1: authenticating, 2: confirmed
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

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

  function openPaymentModal(fee) {
    setSelectedFee(fee);
    setProcessStep(0);
    setPaymentSuccess(null);
    setIsProcessing(false);
  }

  function closePaymentModal() {
    setSelectedFee(null);
    setPaymentSuccess(null);
    setIsProcessing(false);
    setProcessStep(0);
  }

  async function handleExecutePayment(e) {
    if (e) e.preventDefault();
    if (!selectedFee) return;

    setIsProcessing(true);
    setProcessStep(1); // Simulating 2-factor authentication & bank clearance

    try {
      // Simulate banking network authorization delay
      await new Promise((resolve) => setTimeout(resolve, 900));

      const res = await api.post(`/billing/fees/${selectedFee.id}/pay/`, {
        payment_method: paymentMethod,
      });

      setProcessStep(2);
      setPaymentSuccess(res);
      await load();
    } catch (err) {
      setError(err.message || "Payment processing encountered an error.");
      setIsProcessing(false);
      setProcessStep(0);
    }
  }

  async function openReceiptModal(fee) {
    setReceiptLoading(true);
    try {
      const data = await api.get(`/billing/fees/${fee.id}/receipt/`);
      setReceiptData(data);
    } catch (err) {
      setError("Unable to load receipt: " + err.message);
    } finally {
      setReceiptLoading(false);
    }
  }

  const dueFees = fees.filter((f) => f.status === "due" || f.status === "overdue");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finances & Accounts"
        title="Maintenance & Dues"
        actions={
          <div className="flex items-center gap-2 text-xs font-mono text-slate bg-paper border border-line px-3 py-1.5 rounded-lg shadow-xs">
            <Lock size={13} className="text-amber" /> 256-Bit SSL Secured Sandbox
          </div>
        }
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-rust bg-rust-soft/20 border border-rust/30 rounded-xl px-4 py-3 animate-fade-in">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {/* Due Banner Card with Enhanced Visual Polish */}
      {dueFees.length > 0 && (
        <Card className="p-6 relative overflow-hidden border-amber/50 bg-gradient-to-r from-amber-soft/40 via-paper to-amber-soft/20 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-amber px-2.5 py-0.5 rounded-full bg-amber/15 border border-amber/30">
                <Clock size={12} /> Pending Bill
              </div>
              <div className="font-display text-2xl font-bold text-ink">
                ₹{Number(dueFees[0].amount).toLocaleString()}{" "}
                <span className="text-base font-normal text-slate">due for {dueFees[0].period}</span>
              </div>
              <p className="text-xs text-slate flex items-center gap-2">
                Pay online seamlessly via UPI, Credit/Debit Card, or Net Banking.
                {dueFees[0].due_date && (
                  <span className="font-mono text-ink font-medium">Due by: {dueFees[0].due_date}</span>
                )}
              </p>
            </div>

            <button
              onClick={() => openPaymentModal(dueFees[0])}
              className="group flex items-center justify-center gap-2 bg-ink text-paper text-sm font-medium px-6 py-3 rounded-xl hover:bg-ink-soft shadow-md shadow-ink/10 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <CreditCard size={16} className="text-amber transition-transform group-hover:scale-110" />
              Pay Now (Instant Checkout)
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Card>
      )}

      {/* Billing Ledger & Payment History Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div className="font-display font-semibold text-ink flex items-center gap-2">
            <FileText size={18} className="text-amber" />
            Maintenance Invoices & Payment History
          </div>
          <span className="text-xs font-mono text-slate">{fees.length} Total Records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate">Loading financial ledger…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-xs uppercase tracking-wider text-slate border-b border-line bg-mist/50">
                  <th className="px-6 py-3.5 font-medium">Period</th>
                  <th className="px-6 py-3.5 font-medium">Amount</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium">Payment Mode</th>
                  <th className="px-6 py-3.5 font-medium">Paid On</th>
                  <th className="px-6 py-3.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {fees.map((f) => (
                  <tr key={f.id} className="hover:bg-mist/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-ink flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber" />
                      {f.period}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-ink">
                      ₹{Number(f.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate">
                      {f.payment_method ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-mist border border-line text-ink">
                          {f.payment_method.toUpperCase()}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate">
                      {f.paid_on ? new Date(f.paid_on).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {f.status === "paid" ? (
                        <button
                          onClick={() => openReceiptModal(f)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink bg-mist border border-line px-3 py-1.5 rounded-lg hover:bg-amber-soft hover:border-amber/40 transition-all cursor-pointer"
                        >
                          <FileText size={13} className="text-amber" />
                          View Receipt
                        </button>
                      ) : (
                        <button
                          onClick={() => openPaymentModal(f)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-paper bg-ink px-3 py-1.5 rounded-lg hover:bg-ink-soft shadow-xs transition-colors cursor-pointer"
                        >
                          Pay ₹{Number(f.amount).toLocaleString()}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* =========================================================================
          MODAL 1: MULTI-CHANNEL ONLINE PAYMENT GATEWAY (UPI, CARD, NET BANKING)
         ========================================================================= */}
      {selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-paper border border-line rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-mist/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-soft text-ink flex items-center justify-center font-bold text-sm">
                  ₹
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink leading-tight">Payment Checkout</h3>
                  <p className="text-xs text-slate font-mono">
                    {selectedFee.period} Maintenance • Flat {selectedFee.flat || "My Unit"}
                  </p>
                </div>
              </div>
              <button
                onClick={closePaymentModal}
                disabled={isProcessing}
                className="text-slate hover:text-ink p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Bill Summary Strip */}
            <div className="px-6 py-3 bg-amber/10 border-b border-amber/20 flex items-center justify-between">
              <span className="text-xs text-slate font-medium">Total Payable Amount</span>
              <span className="font-display text-xl font-bold text-ink">
                ₹{Number(selectedFee.amount).toLocaleString()}
              </span>
            </div>

            {/* Success State */}
            {paymentSuccess ? (
              <div className="p-8 text-center space-y-4 animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-green-soft text-green flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h4 className="font-display text-xl font-bold text-ink">Payment Successful!</h4>
                  <p className="text-sm text-slate mt-1">
                    Your payment of ₹{Number(selectedFee.amount).toLocaleString()} has been recorded.
                  </p>
                  <p className="text-xs font-mono text-slate mt-2 bg-mist border border-line py-1.5 px-3 rounded-lg inline-block">
                    Reference ID: {paymentSuccess.order_id}
                  </p>
                </div>
                <div className="pt-4 flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      const updated = fees.find((f) => f.id === selectedFee.id) || selectedFee;
                      closePaymentModal();
                      openReceiptModal(updated);
                    }}
                    className="flex items-center gap-2 bg-amber text-ink font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-amber/90 transition-colors shadow-sm cursor-pointer"
                  >
                    <FileText size={16} /> View Official Receipt
                  </button>
                  <button
                    onClick={closePaymentModal}
                    className="border border-line text-slate hover:text-ink text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : isProcessing ? (
              /* Processing Animation State */
              <div className="p-12 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-full border-4 border-amber/30 border-t-amber animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-amber">
                    <ShieldCheck size={24} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-display font-semibold text-ink text-base">
                    {processStep === 1 ? "Connecting to Payment Gateway…" : "Authorizing Transaction…"}
                  </div>
                  <p className="text-xs text-slate">
                    Please do not refresh or close this window. Securing channel with bank.
                  </p>
                </div>
              </div>
            ) : (
              /* Checkout Method Selection Form */
              <div className="p-6 space-y-5">
                {/* Method Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-mist border border-line rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      paymentMethod === "upi"
                        ? "bg-paper text-ink shadow-xs border border-line/60 font-semibold"
                        : "text-slate hover:text-ink"
                    }`}
                  >
                    <QrCode size={14} className={paymentMethod === "upi" ? "text-amber" : ""} />
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      paymentMethod === "card"
                        ? "bg-paper text-ink shadow-xs border border-line/60 font-semibold"
                        : "text-slate hover:text-ink"
                    }`}
                  >
                    <CreditCard size={14} className={paymentMethod === "card" ? "text-amber" : ""} />
                    Debit / Credit
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("net_banking")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      paymentMethod === "net_banking"
                        ? "bg-paper text-ink shadow-xs border border-line/60 font-semibold"
                        : "text-slate hover:text-ink"
                    }`}
                  >
                    <Landmark size={14} className={paymentMethod === "net_banking" ? "text-amber" : ""} />
                    Net Banking
                  </button>
                </div>

                {/* Tab 1: UPI */}
                {paymentMethod === "upi" && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-slate mb-1.5">
                        Enter UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        className="w-full border border-line rounded-xl px-3.5 py-2.5 text-sm font-mono focus-visible:outline-amber bg-mist/20"
                      />
                    </div>
                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap gap-1.5">
                      {["@okaxis", "@okhdfcbank", "@paytm", "@ibl", "@ybl"].map((suffix) => (
                        <button
                          key={suffix}
                          type="button"
                          onClick={() => setUpiId((prev) => prev.split("@")[0] + suffix)}
                          className="text-[11px] font-mono border border-line rounded-md px-2 py-0.5 text-slate hover:text-ink hover:bg-mist transition-colors"
                        >
                          {suffix}
                        </button>
                      ))}
                    </div>

                    <div className="p-3 bg-mist/60 border border-line rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-soft flex items-center justify-center text-ink shrink-0">
                        <QrCode size={20} />
                      </div>
                      <div className="text-xs text-slate">
                        <span className="font-semibold text-ink">Scan & Pay</span>: Instant simulation. You can authorize directly without switching apps.
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Cards */}
                {paymentMethod === "card" && (
                  <div className="space-y-3.5 animate-fade-in">
                    {/* Virtual Card Preview */}
                    <div className="p-4 rounded-xl bg-gradient-to-tr from-ink via-ink-soft to-slate text-paper shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-20">
                        <CreditCard size={80} />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-mono tracking-widest uppercase text-amber">Residentia Pay</span>
                        <span className="text-xs font-mono text-paper/70">DEBIT / CREDIT</span>
                      </div>
                      <div className="font-mono text-sm tracking-widest mb-3">
                        {cardData.number || "•••• •••• •••• ••••"}
                      </div>
                      <div className="flex justify-between text-[11px] font-mono text-paper/80">
                        <span>{cardData.name || "CARDHOLDER"}</span>
                        <span>EXP {cardData.expiry || "MM/YY"}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-slate mb-1">Card Number</label>
                      <input
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono focus-visible:outline-amber"
                        placeholder="4532 •••• •••• ••••"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-slate mb-1">Expiry Date</label>
                        <input
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono focus-visible:outline-amber"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-slate mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="w-full border border-line rounded-lg px-3 py-2 text-sm font-mono focus-visible:outline-amber"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Net Banking */}
                {paymentMethod === "net_banking" && (
                  <div className="space-y-3 animate-fade-in">
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate">
                      Select Popular Bank
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Bank", "Punjab National Bank"].map(
                        (b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                              selectedBank === b
                                ? "border-amber bg-amber-soft/40 text-ink font-semibold shadow-xs"
                                : "border-line hover:border-slate/40 text-slate hover:text-ink"
                            }`}
                          >
                            <Landmark size={14} className="mb-1 text-slate" />
                            {b}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Pay Button */}
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  className="w-full flex items-center justify-center gap-2 bg-ink text-paper font-semibold text-sm py-3.5 rounded-xl hover:bg-ink-soft transition-all duration-200 shadow-md shadow-ink/10 hover:scale-[1.01] cursor-pointer mt-4"
                >
                  <Lock size={15} className="text-amber" />
                  Pay ₹{Number(selectedFee.amount).toLocaleString()} Securely
                </button>

                <p className="text-center text-[11px] text-slate font-mono">
                  Sandbox Test Mode • Instant ledger reconciliation & receipt dispatch
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: OFFICIAL DOWNLOADABLE & PRINTABLE PAYMENT RECEIPT
         ========================================================================= */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-paper border border-line rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            {/* Modal Controls Topbar */}
            <div className="px-6 py-3 border-b border-line flex items-center justify-between bg-mist/60 print:hidden">
              <div className="text-xs font-mono text-slate flex items-center gap-1.5">
                <FileText size={14} className="text-amber" /> Official Society E-Receipt
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs font-medium text-ink bg-paper border border-line px-3 py-1.5 rounded-lg hover:bg-mist transition-colors cursor-pointer shadow-xs"
                >
                  <Printer size={13} /> Print / PDF
                </button>
                <button
                  onClick={() => setReceiptData(null)}
                  className="text-slate hover:text-ink p-1 rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-8 overflow-y-auto space-y-6 relative bg-paper text-ink font-sans">
              {/* PAID Watermark Badge */}
              <div className="absolute right-8 top-8 border-2 border-green text-green px-4 py-1.5 rounded-lg font-mono font-bold text-xs tracking-widest uppercase rotate-[-6deg] bg-green-soft/30 shadow-xs">
                PAID & VERIFIED
              </div>

              {/* Society Letterhead */}
              <div className="border-b-2 border-ink/10 pb-5">
                <div className="font-mono text-[11px] tracking-widest text-amber uppercase font-semibold">
                  Co-operative Housing Society
                </div>
                <h2 className="font-display text-2xl font-bold text-ink tracking-tight">
                  {receiptData.society.name}
                </h2>
                <p className="text-xs text-slate mt-1">{receiptData.society.address}</p>
                <p className="text-[11px] font-mono text-slate">
                  Reg No: {receiptData.society.registration_no} • {receiptData.society.email}
                </p>
              </div>

              {/* Receipt Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-mist/40 p-4 rounded-xl border border-line">
                <div>
                  <span className="text-slate block text-[10px] uppercase">Receipt Number</span>
                  <span className="font-bold text-ink text-sm">{receiptData.receipt_number || "REC-2026-0001"}</span>
                </div>
                <div>
                  <span className="text-slate block text-[10px] uppercase">Date & Time</span>
                  <span className="font-medium text-ink">{receiptData.date || "Just now"}</span>
                </div>
                <div>
                  <span className="text-slate block text-[10px] uppercase">Received From</span>
                  <span className="font-semibold text-ink">{receiptData.resident.name}</span>
                  <span className="text-slate block">Flat No: {receiptData.resident.flat}</span>
                </div>
                <div>
                  <span className="text-slate block text-[10px] uppercase">Payment Method</span>
                  <span className="font-medium text-ink capitalize">{receiptData.payment_method}</span>
                  <span className="text-slate block truncate text-[10px]">
                    Ref: {receiptData.transaction_reference}
                  </span>
                </div>
              </div>

              {/* Itemized Charges Breakdown */}
              <div>
                <div className="font-display font-semibold text-sm text-ink mb-2">
                  Invoice Breakdown for {receiptData.period}
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-line text-slate font-mono text-[11px] text-left">
                      <th className="py-2">Component</th>
                      <th className="py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {receiptData.breakdown && Object.keys(receiptData.breakdown).length > 0 ? (
                      Object.entries(receiptData.breakdown).map(([k, v]) => (
                        <tr key={k}>
                          <td className="py-2.5 text-slate">{k}</td>
                          <td className="py-2.5 font-mono text-right font-medium">
                            ₹{Number(v).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2.5 text-slate">Standard Monthly Society Maintenance</td>
                        <td className="py-2.5 font-mono text-right font-medium">
                          ₹{receiptData.total_amount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    <tr className="font-bold text-ink border-t-2 border-ink/20">
                      <td className="py-3 text-sm font-display">Total Amount Paid</td>
                      <td className="py-3 font-mono text-base text-right text-ink">
                        ₹{receiptData.total_amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatory Footer */}
              <div className="pt-6 border-t border-line flex justify-between items-end text-xs">
                <div className="text-[11px] text-slate font-mono">
                  This is a computer-generated receipt.<br />
                  No physical signature required.
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-semibold text-ink">Residentia Management Committee</div>
                  <div className="text-[10px] text-slate uppercase tracking-wider">Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}