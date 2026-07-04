import type { CategoryBreakdown } from "../api/types";
import { CATEGORY_COLOR } from "../theme/categoryColors";

interface CategoryBarChartProps {
  data: CategoryBreakdown[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3.5 py-1">
      {sorted.map((entry) => (
        <div key={entry.category} className="flex items-center gap-3 group">
          <div className="w-28 shrink-0 text-xs" style={{ color: "var(--adm-text-secondary)" }}>
            {entry.category}
          </div>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--adm-gridline)" }}>
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${Math.max(entry.percentage, entry.count > 0 ? 2 : 0)}%`,
                backgroundColor: CATEGORY_COLOR[entry.category],
                boxShadow: entry.count > 0 ? `0 0 12px color-mix(in srgb, ${CATEGORY_COLOR[entry.category]} 55%, transparent)` : undefined,
              }}
            />
          </div>
          <div
            className="w-20 shrink-0 text-xs text-right tabular-nums"
            style={{ color: "var(--adm-text-secondary)" }}
          >
            {entry.count} <span style={{ color: "var(--adm-text-muted)" }}>· {entry.percentage}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
