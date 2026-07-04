import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Sparkles, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NAV_ITEMS } from "./navItems";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { email, logout } = useAuth();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="absolute left-0 top-0 h-full w-72 max-w-[85vw] flex flex-col"
        style={{ background: "var(--adm-bg)", borderRight: "1px solid var(--adm-border)" }}
      >
        <div className="flex items-center justify-between gap-2 px-5 h-16" style={{ borderBottom: "1px solid var(--adm-border)" }}>
          <div className="flex items-center gap-2">
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: "var(--adm-text-secondary)" }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/admin"}
              onClick={onClose}
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
              onClick={() => {
                onClose();
                logout();
              }}
              title="Sign out"
              className="transition-colors hover:text-white"
              style={{ color: "var(--adm-text-muted)" }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
