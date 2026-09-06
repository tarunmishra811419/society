import { useState } from "react";

const statusColor = {
  available: "bg-green-soft border-green/40 text-green",
  occupied: "bg-rust-soft border-rust/40 text-rust",
  reserved: "bg-amber-soft border-amber/50 text-ink",
};

export default function ParkingGrid({ slots, onSelect }) {
  const [activeCode, setActiveCode] = useState(null);
  const blocks = [...new Set(slots.map((s) => s.block))];

  function handleSelect(slot) {
    setActiveCode(slot.code);
    onSelect?.(slot);
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, bi) => {
        const blockSlots = slots.filter((s) => s.block === block);
        return (
          <div key={block}>
            <div className="font-mono text-xs tracking-widest text-slate uppercase mb-2.5">
              Block {block}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {blockSlots.map((slot, si) => (
                <button
                  key={slot.code}
                  onClick={() => handleSelect(slot)}
                  title={slot.assignedTo || "Available"}
                  style={{ animationDelay: `${(bi * blockSlots.length + si) * 0.02}s` }}
                  className={`relative aspect-[4/3] rounded-md border-2 flex flex-col items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:scale-105 animate-scale-in ${
                    statusColor[slot.status]
                  } ${
                    activeCode === slot.code
                      ? "ring-2 ring-offset-2 ring-ink scale-105 -translate-y-1 shadow-lg"
                      : ""
                  }`}
                >
                  <span className="font-mono text-[11px] font-semibold">
                    {slot.code}
                  </span>
                  <span
                    className={`absolute bottom-1 w-2 h-2 rounded-full bg-current opacity-60 ${
                      slot.status === "available" ? "animate-pulse-dot" : ""
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-5 pt-2 font-mono text-xs text-slate">
        <Legend color="bg-green-soft border-green/40" label="Available" />
        <Legend color="bg-rust-soft border-rust/40" label="Occupied" />
        <Legend color="bg-amber-soft border-amber/50" label="Reserved" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm border-2 ${color}`} />
      {label}
    </div>
  );
}