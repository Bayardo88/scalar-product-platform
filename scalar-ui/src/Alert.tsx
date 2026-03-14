import React from "react";
import { colors, spacing, radii, typography } from "./tokens";

export interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  info: { bg: "#eff6ff", border: colors.info, color: "#1e40af", icon: "ℹ" },
  success: { bg: "#ecfdf5", border: colors.success, color: "#065f46", icon: "✓" },
  warning: { bg: "#fffbeb", border: colors.warning, color: "#92400e", icon: "⚠" },
  error: { bg: "#fef2f2", border: colors.error, color: "#991b1b", icon: "✕" },
};

export function Alert({ variant = "info", title, children, onDismiss, className }: AlertProps) {
  const style = variantStyles[variant];

  return (
    <div
      className={className}
      role="alert"
      style={{
        display: "flex",
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.md,
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        fontFamily: typography.fontFamily,
      }}
    >
      <span style={{ fontSize: 16 }}>{style.icon}</span>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 600, fontSize: 14, color: style.color, marginBottom: 2 }}>{title}</div>}
        <div style={{ fontSize: 14, color: style.color }}>{children}</div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} style={{ border: "none", background: "none", cursor: "pointer", color: style.color, fontSize: 16, padding: 0 }}>×</button>
      )}
    </div>
  );
}
