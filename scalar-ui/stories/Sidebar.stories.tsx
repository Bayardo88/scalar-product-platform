import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "../src/Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "DS/Scalar/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "projects", label: "Projects", icon: "📁" },
  { id: "tasks", label: "Tasks", icon: "✅" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export const Default: Story = {
  args: {
    items: navItems,
    activeId: "dashboard",
    header: <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Scalar</div>,
  },
};

export const WithActiveItem: Story = {
  args: { items: navItems, activeId: "projects" },
};

export const Minimal: Story = {
  args: {
    items: [
      { id: "home", label: "Home" },
      { id: "settings", label: "Settings" },
    ],
  },
};
