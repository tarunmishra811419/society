export function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-start justify-between mb-8 animate-fade-in-up">
      <div>
        {eyebrow && (
          <div className="font-mono text-xs tracking-widest text-slate uppercase mb-1.5">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      </div>
      {action}
    </div>
  );
}

const statusStyles = {
  active: "bg-green-soft text-green",
  paid: "bg-green-soft text-green",
  approved: "bg-green-soft text-green",
  resolved: "bg-green-soft text-green",
  "checked-in": "bg-green-soft text-green",
  available: "bg-green-soft text-green",

  pending: "bg-amber-soft text-ink",
  "in-progress": "bg-amber-soft text-ink",
  "awaiting-approval": "bg-amber-soft text-ink",
  reserved: "bg-amber-soft text-ink",
  due: "bg-amber-soft text-ink",

  open: "bg-rust-soft text-rust",
  occupied: "bg-rust-soft text-rust",
  overdue: "bg-rust-soft text-rust",

  "checked-out": "bg-mist text-slate",
};

const pulsingStatuses = new Set(["pending", "in-progress", "awaiting-approval", "open"]);

export function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-mist text-slate";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium font-mono transition-transform duration-150 hover:scale-105 ${style}`}
    >
      {pulsingStatuses.has(status) && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
      )}
      {status.replace("-", " ")}
    </span>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-paper border border-line rounded-xl hover-lift ${className}`}
    >
      {children}
    </div>
  );
}

export function StatTile({ label, value, sub }) {
  return (
    <Card className="p-5 animate-scale-in">
      <div className="font-mono text-xs tracking-wide text-slate uppercase mb-2">
        {label}
      </div>
      <div className="font-display text-2xl font-semibold text-ink transition-transform duration-200">
        {value}
      </div>
      {sub && <div className="text-xs text-slate mt-1">{sub}</div>}
    </Card>
  );
}