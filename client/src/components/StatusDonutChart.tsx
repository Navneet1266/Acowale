import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusBreakdown } from "../api/types";
import { STATUS_STYLE } from "../theme/categoryColors";

const STATUS_COLOR: Record<string, string> = {
  open: "var(--adm-text-muted)",
  in_progress: "var(--adm-warning)",
  resolved: "var(--adm-good)",
};

interface StatusDonutChartProps {
  data: StatusBreakdown[];
  height?: number;
}

export function StatusDonutChart({ data, height = 200 }: StatusDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const chartData = data.map((d) => ({ ...d, label: STATUS_STYLE[d.status]?.label ?? d.status }));
  const hasData = total > 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={hasData ? chartData : [{ status: "empty", label: "empty", count: 1 }]}
              dataKey="count"
              nameKey="label"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={hasData ? 3 : 0}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {hasData ? (
                chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLOR[entry.status] ?? "var(--adm-accent)"} />
                ))
              ) : (
                <Cell fill="var(--adm-gridline)" />
              )}
            </Pie>
            {hasData && (
              <Tooltip
                contentStyle={{
                  background: "var(--adm-surface-solid)",
                  border: "1px solid var(--adm-border-strong)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--adm-text-primary)",
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--adm-text-primary)" }}>
            {total}
          </span>
          <span className="text-[10px]" style={{ color: "var(--adm-text-muted)" }}>
            total
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 min-w-0">
        {chartData.map((entry) => (
          <div key={entry.status} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: STATUS_COLOR[entry.status] ?? "var(--adm-accent)" }}
            />
            <span className="flex-1 truncate" style={{ color: "var(--adm-text-secondary)" }}>
              {entry.label}
            </span>
            <span className="tabular-nums font-medium" style={{ color: "var(--adm-text-primary)" }}>
              {entry.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
