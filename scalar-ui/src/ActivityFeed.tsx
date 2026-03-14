import React from "react";
import { colors, spacing, radii, typography, shadows } from "./tokens";

export interface FeedItem {
  id: string;
  actor: string;
  action: string;
  target?: string;
  timestamp: string;
}

export interface ActivityFeedProps {
  items?: FeedItem[];
  title?: string;
  className?: string;
}

export function ActivityFeed({ items = [], title = "Activity", className }: ActivityFeedProps) {
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
      {items.length === 0 ? (
        <div style={{ color: colors.textMuted, fontSize: 14 }}>No recent activity</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          {items.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: radii.full,
                  backgroundColor: colors.secondary,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 600, color: colors.primary,
                  flexShrink: 0,
                }}
              >
                {item.actor.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 14, color: colors.text }}>
                  <strong>{item.actor}</strong> {item.action} {item.target && <span style={{ color: colors.primary }}>{item.target}</span>}
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{item.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
