import React, { useState } from "react";
import { colors, spacing, typography } from "./tokens";

export interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultActiveId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultActiveId, onChange, className }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultActiveId || tabs[0]?.id);

  const handleClick = (tabId: string) => {
    setActiveId(tabId);
    onChange?.(tabId);
  };

  const activeTab = tabs.find((t) => t.id === activeId);

  return (
    <div className={className} style={{ fontFamily: typography.fontFamily }}>
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            style={{
              padding: `${spacing.sm}px ${spacing.lg}px`,
              border: "none",
              borderBottom: tab.id === activeId ? `2px solid ${colors.primary}` : "2px solid transparent",
              background: "none",
              fontSize: 14,
              fontWeight: tab.id === activeId ? 500 : 400,
              color: tab.id === activeId ? colors.primary : colors.textSecondary,
              cursor: "pointer",
              fontFamily: typography.fontFamily,
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab?.content && <div style={{ padding: `${spacing.lg}px 0` }}>{activeTab.content}</div>}
    </div>
  );
}
