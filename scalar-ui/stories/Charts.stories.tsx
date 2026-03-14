import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AnalyticsChart, BarChart, LineChart, PieChart } from "../src/AnalyticsChart";

const meta: Meta<typeof AnalyticsChart> = {
  title: "DS/Scalar/Charts",
  component: AnalyticsChart,
};
export default meta;
type Story = StoryObj<typeof AnalyticsChart>;

const sampleData = [
  { label: "Jan", value: 120 },
  { label: "Feb", value: 180 },
  { label: "Mar", value: 150 },
  { label: "Apr", value: 220 },
  { label: "May", value: 190 },
  { label: "Jun", value: 280 },
];

export const Default: Story = {
  args: { title: "Revenue Over Time", data: sampleData },
};

export const Bar: Story = {
  render: () => <BarChart title="Monthly Revenue" data={sampleData} />,
};

export const Line: Story = {
  render: () => <LineChart title="User Growth" data={sampleData} />,
};

export const Pie: Story = {
  render: () => <PieChart title="Distribution" data={sampleData} />,
};

export const Empty: Story = {
  args: { title: "No Data Yet", data: [] },
};
