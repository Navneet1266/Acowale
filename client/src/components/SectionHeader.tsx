import type { ReactNode } from "react";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  accent?: string;
  right?: ReactNode;
  className?: string;
}

export function SectionHeader({ icon, title, subtitle, accent = "var(--adm-accent-2)", right, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-3 ${className}`}>
      <div className="flex items-start gap-2.5 min-w-0">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: `color-mix(in srgb, ${accent} 16%, transparent)`,
            color: accent,
          }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight" style={{ color: "var(--adm-text-primary)" }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "var(--adm-text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
