import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { LogOut } from "lucide-react";
import SOSButton from "../components/SOSButton";

export default function DashboardLayout({ title, navItems, children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen flex bg-mist">
      <aside className="w-60 shrink-0 bg-ink text-paper flex flex-col animate-fade-in-up">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="font-mono text-[10px] tracking-widest text-amber uppercase mb-1">
            Residentia
          </div>
          <div className="font-display text-lg font-semibold">{title}</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={{ animationDelay: `${i * 0.04}s` }}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 animate-fade-in-up ${
                  isActive
                    ? "bg-amber text-ink shadow-md shadow-amber/20"
                    : "text-slate hover:bg-white/5 hover:text-paper hover:translate-x-0.5"
                }`
              }
            >
              <Icon
                size={17}
                strokeWidth={2}
                className="transition-transform duration-200 group-hover:scale-110"
              />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 mb-3">
            <div className="text-sm font-medium">{currentUser?.name}</div>
            <div className="font-mono text-xs text-slate">
              {currentUser?.flat || currentUser?.gate || currentUser?.designation}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate hover:bg-white/5 hover:text-rust transition-colors duration-200"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div
          key={location.pathname}
          className="max-w-6xl mx-auto px-8 py-8 animate-fade-in-up"
        >
          {children}
        </div>
      </main>

      {currentUser?.role === "resident" && <SOSButton />}
    </div>
  );
}