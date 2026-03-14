import React from "react";
import { colors, spacing, radii, typography, shadows } from "./tokens";

export interface DetailsPanelProps {
  data?: Record<string, unknown>;
  title?: string;
  className?: string;
}

export function DetailsPanel({ data = {}, title, className }: DetailsPanelProps) {
  const entries = Object.entries(data);

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
      {title && <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: spacing.lg }}>{title}</div>}
      {entries.length === 0 ? (
        <div style={{ color: colors.textMuted, fontSize: 14 }}>No details available</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: `${spacing.sm}px ${spacing.lg}px` }}>
          {entries.map(([key, value]) => (
            <React.Fragment key={key}>
              <div style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary }}>{key}</div>
              <div style={{ fontSize: 14, color: colors.text }}>{String(value ?? "—")}</div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
