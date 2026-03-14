import React from "react";
import { colors, spacing, radii, typography, shadows } from "./tokens";

export interface AnalyticsChartProps {
  title?: string;
  type?: "bar" | "line" | "pie" | "area";
  data?: Array<{ label: string; value: number }>;
  className?: string;
}

export function AnalyticsChart({
  title = "Chart",
  type = "bar",
  data = [],
  className,
}: AnalyticsChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className={className}
      style={{
        padding: spacing.xl,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.sm,
        fontFamily: typography.fontFamily,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: spacing.lg }}>{title}</div>
      {data.length === 0 ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textMuted }}>
          No chart data
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: spacing.sm, height: 200, paddingTop: spacing.md }}>
          {data.map((item, idx) => (
            <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: "100%",
                  height: `${(item.value / maxValue) * 160}px`,
                  backgroundColor: colors.primary,
                  borderRadius: `${radii.sm}px ${radii.sm}px 0 0`,
                  opacity: 0.8 + (idx % 3) * 0.1,
                  minHeight: 4,
                }}
              />
              <span style={{ fontSize: 10, color: colors.textSecondary }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const BarChart = AnalyticsChart;
export const LineChart = (props: AnalyticsChartProps) => <AnalyticsChart {...props} type="line" />;
export const PieChart = (props: AnalyticsChartProps) => <AnalyticsChart {...props} type="pie" />;
