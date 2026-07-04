import { Search } from "lucide-react";
import { FEEDBACK_CATEGORIES, FEEDBACK_STATUSES } from "../api/types";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

const fieldClass =
  "rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors";
const fieldStyle = {
  background: "var(--adm-surface-solid)",
  border: "1px solid var(--adm-border)",
  color: "var(--adm-text-primary)",
};

export function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--adm-text-muted)" }} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search feedback or email..."
          className={`w-full pl-9 pr-3 ${fieldClass}`}
          style={fieldStyle}
        />
      </div>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={fieldClass}
        style={fieldStyle}
      >
        <option value="">All categories</option>
        {FEEDBACK_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={fieldClass}
        style={fieldStyle}
      >
        <option value="">All statuses</option>
        {FEEDBACK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
