import React from "react";
import { colors, spacing, radii, typography, shadows } from "./tokens";

export interface SummaryCardProps {
  label: string;
  value: string | number;
  trend?: { direction: "up" | "down" | "flat"; label: string };
  className?: string;
}

export function SummaryCard({ label, value, trend, className }: SummaryCardProps) {
  const trendColor = trend?.direction === "up" ? colors.success : trend?.direction === "down" ? colors.error : colors.textMuted;

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
      <div style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary, marginBottom: spacing.xs }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>{value}</div>
      {trend && (
        <div style={{ fontSize: 12, color: trendColor, marginTop: spacing.xs }}>
          {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {trend.label}
        </div>
      )}
    </div>
  );
}
