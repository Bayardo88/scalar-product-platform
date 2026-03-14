import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DetailsPanel } from "../src/DetailsPanel";

const meta: Meta<typeof DetailsPanel> = {
  title: "DS/Scalar/DetailsPanel",
  component: DetailsPanel,
};
export default meta;
type Story = StoryObj<typeof DetailsPanel>;

export const Default: Story = {
  args: {
    title: "Project Details",
    data: {
      Name: "Project Alpha",
      Status: "Active",
      Owner: "Alice Johnson",
      Created: "2026-01-15",
      "Due Date": "2026-06-30",
      Priority: "High",
    },
  },
};

export const Empty: Story = { args: { title: "Empty Panel", data: {} } };
