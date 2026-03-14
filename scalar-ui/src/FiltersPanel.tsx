import React from "react";
import { colors, spacing, radii, typography } from "./tokens";

export interface Filter {
  id: string;
  label: string;
  type: "text" | "select";
  options?: string[];
}

export interface FiltersPanelProps {
  filters?: Filter[];
  values?: Record<string, string>;
  onChange?: (filterId: string, value: string) => void;
  onClear?: () => void;
  className?: string;
}

export function FiltersPanel({ filters = [], values = {}, onChange, onClear, className }: FiltersPanelProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        gap: spacing.md,
        alignItems: "flex-end",
        padding: `${spacing.md}px 0`,
        fontFamily: typography.fontFamily,
      }}
    >
      {filters.map((filter) => (
        <div key={filter.id} style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: colors.textSecondary }}>{filter.label}</label>
          {filter.type === "select" ? (
            <select
              value={values[filter.id] || ""}
              onChange={(e) => onChange?.(filter.id, e.target.value)}
              style={{
                padding: `6px ${spacing.sm}px`,
                borderRadius: radii.sm,
                border: `1px solid ${colors.border}`,
                fontSize: 13,
                fontFamily: typography.fontFamily,
              }}
            >
              <option value="">All</option>
              {filter.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input
              type="text"
              value={values[filter.id] || ""}
              onChange={(e) => onChange?.(filter.id, e.target.value)}
              style={{
                padding: `6px ${spacing.sm}px`,
                borderRadius: radii.sm,
                border: `1px solid ${colors.border}`,
                fontSize: 13,
                fontFamily: typography.fontFamily,
              }}
            />
          )}
        </div>
      ))}
      {onClear && (
        <button
          onClick={onClear}
          style={{
            padding: `6px ${spacing.md}px`,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.sm,
            background: colors.surface,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: typography.fontFamily,
            color: colors.textSecondary,
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
