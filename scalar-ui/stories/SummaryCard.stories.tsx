import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SummaryCard } from "../src/SummaryCard";
import { CardGrid } from "../src/CardGrid";

const meta: Meta<typeof SummaryCard> = {
  title: "DS/Scalar/SummaryCard",
  component: SummaryCard,
};
export default meta;
type Story = StoryObj<typeof SummaryCard>;

export const Default: Story = {
  args: { label: "Total Revenue", value: "$48,200" },
};

export const WithTrendUp: Story = {
  args: { label: "Active Users", value: "1,234", trend: { direction: "up", label: "+12% from last month" } },
};

export const WithTrendDown: Story = {
  args: { label: "Churn Rate", value: "3.2%", trend: { direction: "down", label: "-0.5% from last month" } },
};

export const KPIGrid: Story = {
  render: () => (
    <CardGrid columns={4}>
      <SummaryCard label="Revenue" value="$48.2K" trend={{ direction: "up", label: "+12%" }} />
      <SummaryCard label="Users" value="1,234" trend={{ direction: "up", label: "+8%" }} />
      <SummaryCard label="Projects" value="56" trend={{ direction: "flat", label: "No change" }} />
      <SummaryCard label="Tasks" value="342" trend={{ direction: "down", label: "-3%" }} />
    </CardGrid>
  ),
};
