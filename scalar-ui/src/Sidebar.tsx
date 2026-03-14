import React from "react";
import { colors, spacing, typography } from "./tokens";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
}

export interface SidebarProps {
  items?: SidebarItem[];
  activeId?: string;
  onNavigate?: (item: SidebarItem) => void;
  header?: React.ReactNode;
  className?: string;
}

export function Sidebar({ items = [], activeId, onNavigate, header, className }: SidebarProps) {
  return (
    <nav
      className={className}
      style={{
        width: 240,
        minHeight: "100vh",
        backgroundColor: colors.sidebarBg,
        padding: `${spacing.xl}px ${spacing.lg}px`,
        display: "flex",
        flexDirection: "column",
        gap: spacing.xs,
        fontFamily: typography.fontFamily,
      }}
    >
      {header && <div style={{ marginBottom: spacing.xl }}>{header}</div>}
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate?.(item)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
            padding: `${spacing.sm}px ${spacing.md}px`,
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: activeId === item.id ? 500 : 400,
            color: activeId === item.id ? colors.sidebarTextActive : colors.sidebarText,
            backgroundColor: activeId === item.id ? "rgba(255,255,255,0.08)" : "transparent",
            textAlign: "left",
            width: "100%",
            transition: "background-color 0.15s",
            fontFamily: typography.fontFamily,
          }}
        >
          {item.icon && <span>{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </nav>
  );
}
