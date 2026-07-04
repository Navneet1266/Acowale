import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

interface AdminLayoutProps {
  title: string;
  subtitle: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function AdminLayout({ title, subtitle, headerRight, children }: AdminLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative min-h-screen lg:flex" style={{ background: "var(--adm-bg)" }}>
      <div className="adm-grid-texture pointer-events-none fixed inset-0 opacity-[0.25]" />
      <div
        className="pointer-events-none fixed -top-56 left-1/2 -translate-x-1/2 h-[36rem] w-[50rem] rounded-full opacity-[0.10] blur-[120px]"
        style={{ backgroundColor: "var(--adm-accent)" }}
      />

      <Sidebar />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="relative flex-1 min-w-0">
        <header
          className="sticky top-0 z-10 backdrop-blur-xl"
          style={{ borderBottom: "1px solid var(--adm-border)", background: "rgba(10,10,13,0.75)" }}
        >
          <div className="px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                className="lg:hidden h-9 w-9 -ml-1 rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-white/5"
                style={{ color: "var(--adm-text-secondary)", border: "1px solid var(--adm-border)" }}
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <h1
                  className="text-lg font-bold tracking-tight truncate"
                  style={{ color: "var(--adm-text-primary)" }}
                >
                  {title}
                </h1>
                <p className="text-xs truncate" style={{ color: "var(--adm-text-secondary)" }}>
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: "var(--adm-surface)",
                  border: "1px solid var(--adm-border)",
                  color: "var(--adm-text-secondary)",
                }}
              >
                <span className="adm-pulse-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--adm-good)" }} />
                Live
              </div>
              {headerRight}
            </div>
          </div>
        </header>

        <main className="relative px-4 sm:px-8 py-6 sm:py-8 space-y-5 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
