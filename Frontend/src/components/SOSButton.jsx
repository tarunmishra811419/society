import { useState } from "react";
import { Siren, X } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useAlerts } from "../context/useAlerts";

export default function SOSButton() {
  const { currentUser } = useAuth();
  const { raiseSOS } = useAlerts();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  function handleConfirm() {
    raiseSOS({ flat: currentUser?.flat, residentName: currentUser?.name });
    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setSent(false);
    }, 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-rust text-paper font-mono text-xs font-semibold uppercase tracking-wide px-4 py-3 rounded-full shadow-lg shadow-rust/30 hover:scale-105 hover:shadow-xl hover:shadow-rust/40 transition-all duration-200 animate-scale-in"
      >
        <Siren size={16} />
        SOS
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm animate-fade-in px-6">
          <div className="bg-paper rounded-2xl p-6 max-w-sm w-full animate-scale-in relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-slate hover:text-ink"
            >
              <X size={18} />
            </button>

            {!sent ? (
              <>
                <div className="w-12 h-12 rounded-full bg-rust-soft flex items-center justify-center text-rust mb-4">
                  <Siren size={22} />
                </div>
                <div className="font-display text-lg font-semibold mb-1.5">
                  Send emergency alert?
                </div>
                <p className="text-sm text-slate mb-6">
                  This immediately notifies security and admin with your flat number
                  ({currentUser?.flat}) and location. Only use for real emergencies.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 border border-line text-sm font-medium py-2.5 rounded-lg hover:bg-mist transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 bg-rust text-paper text-sm font-medium py-2.5 rounded-lg hover:bg-rust/90 transition-colors"
                  >
                    Send SOS
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-soft flex items-center justify-center text-green mx-auto mb-4">
                  <Siren size={22} />
                </div>
                <div className="font-display text-lg font-semibold mb-1.5">
                  Alert sent
                </div>
                <p className="text-sm text-slate">
                  Security and admin have been notified — help is on the way.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}