import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "../src/Tabs";

const meta: Meta<typeof Tabs> = {
  title: "DS/Scalar/Tabs",
  component: Tabs,
};
export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    tabs: [
      { id: "overview", label: "Overview", content: React.createElement("div", null, "Overview content goes here.") },
      { id: "tasks", label: "Tasks", content: React.createElement("div", null, "Task list here.") },
      { id: "files", label: "Files", content: React.createElement("div", null, "File browser here.") },
      { id: "settings", label: "Settings", content: React.createElement("div", null, "Project settings.") },
    ],
    defaultActiveId: "overview",
  },
};
