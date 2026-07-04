import type { TrendPoint } from "../api/types";

interface TrendHeatmapProps {
  data: TrendPoint[];
  days?: number;
}

function toKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TrendHeatmap({ data, days = 30 }: TrendHeatmapProps) {
  const countByDate = new Map(data.map((d) => [d.date, d.count]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));

  const cells: { date: Date; key: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = toKey(d);
    cells.push({ date: d, key, count: countByDate.get(key) ?? 0 });
  }

  // Pad the front so the grid aligns to real weekdays, like a GitHub contribution graph.
  const leadingPad = start.getDay();
  const paddedCells: Array<typeof cells[number] | null> = [
    ...Array.from({ length: leadingPad }, () => null),
    ...cells,
  ];
  const weekCount = Math.ceil(paddedCells.length / 7);
  const columns: Array<Array<typeof cells[number] | null>> = Array.from({ length: weekCount }, (_, w) =>
    paddedCells.slice(w * 7, w * 7 + 7),
  );

  const maxCount = Math.max(...cells.map((c) => c.count), 1);
  const totalDays = cells.length;
  const activeDays = cells.filter((c) => c.count > 0).length;

  function intensity(count: number): number {
    if (count === 0) return 0;
    return 22 + (count / maxCount) * 78;
  }

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {columns.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell, di) =>
              cell ? (
                <div
                  key={cell.key}
                  title={`${cell.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: ${
                    cell.count === 1 ? "1 submission" : `${cell.count} submissions`
                  }`}
                  className="h-3.5 w-3.5 rounded-[3px] transition-transform hover:scale-125"
                  style={{
                    backgroundColor:
                      cell.count === 0
                        ? "var(--adm-gridline)"
                        : `color-mix(in srgb, var(--adm-accent-2) ${intensity(cell.count)}%, var(--adm-gridline))`,
                  }}
                />
              ) : (
                <div key={`pad-${di}`} className="h-3.5 w-3.5" />
              ),
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 text-xs" style={{ color: "var(--adm-text-muted)" }}>
        <span>
          {activeDays} of {totalDays} days had submissions
        </span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {[0, 25, 50, 75, 100].map((pct) => (
            <div
              key={pct}
              className="h-3 w-3 rounded-[3px]"
              style={{
                backgroundColor:
                  pct === 0 ? "var(--adm-gridline)" : `color-mix(in srgb, var(--adm-accent-2) ${pct}%, var(--adm-gridline))`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
