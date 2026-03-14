import React from "react";
import { colors, spacing, typography, shadows } from "./tokens";

export interface TopbarProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Topbar({ title, children, className }: TopbarProps) {
  return (
    <header
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
        padding: `0 ${spacing.xl}px`,
        backgroundColor: colors.topbarBg,
        borderBottom: `1px solid ${colors.topbarBorder}`,
        fontFamily: typography.fontFamily,
      }}
    >
      {title && <h1 style={{ fontSize: 16, fontWeight: 600, color: colors.text, margin: 0 }}>{title}</h1>}
      <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>{children}</div>
    </header>
  );
}
