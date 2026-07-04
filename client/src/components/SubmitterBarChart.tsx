import type { Submitter } from "../api/types";

interface SubmitterBarChartProps {
  submitters: Submitter[];
}

export function SubmitterBarChart({ submitters }: SubmitterBarChartProps) {
  const top = submitters.slice(0, 8);
  const max = Math.max(...top.map((s) => s.count), 1);

  return (
    <div className="space-y-3.5 py-1">
      {top.map((s) => (
        <div key={s.email} className="flex items-center gap-3">
          <div className="w-36 shrink-0 text-xs truncate" style={{ color: "var(--adm-text-secondary)" }} title={s.email}>
            {s.email}
          </div>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--adm-gridline)" }}>
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${(s.count / max) * 100}%`,
                backgroundColor: "var(--adm-accent-2)",
                boxShadow: "0 0 12px rgba(129,140,248,0.5)",
              }}
            />
          </div>
          <div className="w-8 shrink-0 text-xs text-right tabular-nums" style={{ color: "var(--adm-text-secondary)" }}>
            {s.count}
          </div>
        </div>
      ))}
    </div>
  );
}
