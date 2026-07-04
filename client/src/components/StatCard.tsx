import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp";
import { GlassCard } from "./GlassCard";

interface StatCardProps {
  label: string;
  value: number | null;
  icon?: ReactNode;
  accent?: string;
  delta?: number;
  deltaLabel?: string;
}

export function StatCard({ label, value, icon, accent = "var(--adm-accent)", delta, deltaLabel }: StatCardProps) {
  const animated = useCountUp(value);
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const isUp = hasDelta && delta > 0;
  const isFlat = hasDelta && delta === 0;

  return (
    <GlassCard glow={accent} accent={accent} interactive>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: "var(--adm-text-secondary)" }}>
            {label}
          </p>
          <p
            className="text-4xl font-bold leading-tight mt-1.5 tracking-tight tabular-nums"
            style={{ color: "var(--adm-text-primary)" }}
          >
            {value === null ? "–" : animated}
          </p>
          {hasDelta && (
            <p
              className="flex items-center gap-1 text-xs font-medium mt-2"
              style={{ color: isFlat ? "var(--adm-text-muted)" : isUp ? "var(--adm-good)" : "var(--adm-critical)" }}
            >
              {!isFlat && (isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />)}
              {isFlat ? "No change" : `${Math.abs(delta).toFixed(0)}%`} {deltaLabel}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 28%, transparent), color-mix(in srgb, ${accent} 10%, transparent))`,
              color: accent,
              boxShadow: `0 0 0 1px color-mix(in srgb, ${accent} 22%, transparent)`,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
