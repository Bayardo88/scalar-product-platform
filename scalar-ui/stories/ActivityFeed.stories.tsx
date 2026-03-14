import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ActivityFeed } from "../src/ActivityFeed";

const meta: Meta<typeof ActivityFeed> = {
  title: "DS/Scalar/ActivityFeed",
  component: ActivityFeed,
};
export default meta;
type Story = StoryObj<typeof ActivityFeed>;

export const Default: Story = {
  args: {
    title: "Recent Activity",
    items: [
      { id: "1", actor: "Alice", action: "created", target: "Project Alpha", timestamp: "2 minutes ago" },
      { id: "2", actor: "Bob", action: "completed task", target: "Design review", timestamp: "15 minutes ago" },
      { id: "3", actor: "Carol", action: "commented on", target: "Sprint planning", timestamp: "1 hour ago" },
      { id: "4", actor: "Dave", action: "deployed", target: "v1.2.0", timestamp: "3 hours ago" },
    ],
  },
};

export const Empty: Story = { args: { items: [] } };
