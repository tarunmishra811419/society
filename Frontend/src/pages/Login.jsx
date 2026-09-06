import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(username, password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.message || "Login failed. Check your username and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-ink flex flex-col overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07] animate-grid-pan"
        style={{
          backgroundImage:
            "linear-gradient(#E8A337 1px, transparent 1px), linear-gradient(90deg, #E8A337 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-amber/20 blur-[100px] animate-float" />
      <div className="absolute -bottom-40 -right-24 w-[480px] h-[480px] rounded-full bg-ink-soft blur-[110px] animate-float-slow" />

      <div className="relative flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-amber uppercase mb-4 border border-amber/40 rounded-full px-3 py-1">
              ● Gate Access Terminal
            </div>
            <h1 className="font-display text-4xl font-semibold text-paper mb-3">
              Greenfield <span className="shimmer-text">Residency</span>
            </h1>
            <p className="text-slate text-base">Sign in to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Username
              </label>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-paper focus-visible:outline-amber"
                placeholder="e.g. ritika_sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-slate mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-paper focus-visible:outline-amber"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-sm text-rust bg-rust-soft/20 border border-rust/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-amber text-ink font-medium py-2.5 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center font-mono text-xs text-slate mt-6">
            Try: ritika_sharma / arjun_mehta / priya_nair / naveen_kumar (password: demo1234), or your own admin login.
          </p>
        </div>
      </div>
    </div>
  );
}