import React from "react";
import { colors, spacing, radii, typography, shadows } from "./tokens";

export interface DataTableColumn {
  key: string;
  label: string;
  width?: number;
}

export interface DataTableProps {
  columns?: DataTableColumn[];
  data: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
  className?: string;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  data,
  onRowClick,
  className,
  emptyMessage = "No data available.",
}: DataTableProps) {
  const cols: DataTableColumn[] = columns || (data.length > 0 ? Object.keys(data[0]).map((k) => ({ key: k, label: k })) : []);

  return (
    <div
      className={className}
      style={{
        borderRadius: radii.lg,
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
        backgroundColor: colors.surface,
        boxShadow: shadows.sm,
        fontFamily: typography.fontFamily,
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: colors.background }}>
            {cols.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: `${spacing.sm}px ${spacing.lg}px`,
                  fontSize: 12,
                  fontWeight: 500,
                  color: colors.textSecondary,
                  borderBottom: `1px solid ${colors.border}`,
                  width: col.width,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={cols.length}
                style={{ padding: spacing.xl, textAlign: "center", color: colors.textMuted, fontSize: 14 }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                style={{
                  cursor: onRowClick ? "pointer" : undefined,
                  borderBottom: idx < data.length - 1 ? `1px solid ${colors.border}` : undefined,
                }}
              >
                {cols.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: `${spacing.sm}px ${spacing.lg}px`,
                      fontSize: 14,
                      color: colors.text,
                    }}
                  >
                    {String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
