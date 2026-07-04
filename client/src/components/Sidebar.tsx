import { NavLink } from "react-router-dom";
import { LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NAV_ITEMS } from "./navItems";

export function Sidebar() {
  const { email, logout } = useAuth();

  return (
    <aside
      className="relative hidden lg:flex w-60 shrink-0 flex-col h-screen sticky top-0 z-20"
      style={{ background: "rgba(10,10,13,0.7)", borderRight: "1px solid var(--adm-border)" }}
    >
      <div className="flex items-center gap-2 px-5 h-16" style={{ borderBottom: "1px solid var(--adm-border)" }}>
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "var(--adm-accent)", boxShadow: "0 0 16px rgba(99,102,241,0.45)" }}
        >
          A
        </div>
        <span className="font-semibold tracking-tight" style={{ color: "var(--adm-text-primary)" }}>
          Acodash
        </span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) => `group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              isActive ? "" : "hover:bg-white/5"
            }`}
            style={({ isActive }) => ({
              color: isActive ? "var(--adm-text-primary)" : "var(--adm-text-secondary)",
              background: isActive ? "rgba(99,102,241,0.14)" : undefined,
              boxShadow: isActive ? "inset 0 0 0 1px rgba(99,102,241,0.28)" : undefined,
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-full"
                    style={{ background: "var(--adm-accent)" }}
                  />
                )}
                <Icon size={17} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className="mx-3 mb-3 rounded-xl p-4 overflow-hidden relative"
        style={{ background: "rgba(99,102,241,0.10)", border: "1px solid var(--adm-border-strong)" }}
      >
        <Sparkles size={16} className="mb-2" style={{ color: "var(--adm-accent-2)" }} />
        <p className="text-xs font-medium leading-snug" style={{ color: "var(--adm-text-primary)" }}>
          Every submission here feeds real product decisions.
        </p>
      </div>

      <div className="p-3" style={{ borderTop: "1px solid var(--adm-border)" }}>
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ background: "var(--adm-surface-solid)", color: "var(--adm-text-secondary)", border: "1px solid var(--adm-border)" }}
          >
            {email ? email[0].toUpperCase() : "A"}
          </div>
          <span className="text-xs truncate flex-1" style={{ color: "var(--adm-text-secondary)" }}>
            {email}
          </span>
          <button
            type="button"
            onClick={logout}
            title="Sign out"
            className="transition-colors hover:text-white"
            style={{ color: "var(--adm-text-muted)" }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
