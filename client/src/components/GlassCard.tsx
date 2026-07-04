import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: string;
  accent?: string;
  interactive?: boolean;
}

export function GlassCard({ children, glow, accent, interactive = false, className = "", ...rest }: GlassCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 ${
        interactive ? "hover:-translate-y-0.5 cursor-pointer" : ""
      } ${className}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0) 40%), var(--adm-surface-solid)",
        borderColor: "var(--adm-border)",
        boxShadow: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 24px -12px rgba(0,0,0,0.5)",
      }}
      {...rest}
    >
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-[2px] opacity-70"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      )}
      {glow && (
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-20"
          style={{ backgroundColor: glow }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
