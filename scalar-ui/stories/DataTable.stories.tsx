import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DataTable } from "../src/DataTable";

const meta: Meta<typeof DataTable> = {
  title: "DS/Scalar/DataTable",
  component: DataTable,
};
export default meta;
type Story = StoryObj<typeof DataTable>;

const sampleData = [
  { id: "1", name: "Project Alpha", status: "Active", owner: "Alice" },
  { id: "2", name: "Project Beta", status: "Planning", owner: "Bob" },
  { id: "3", name: "Project Gamma", status: "Done", owner: "Carol" },
  { id: "4", name: "Project Delta", status: "Active", owner: "Dave" },
];

export const Default: Story = {
  args: {
    data: sampleData,
    columns: [
      { key: "name", label: "Name" },
      { key: "status", label: "Status" },
      { key: "owner", label: "Owner" },
    ],
  },
};

export const WithRowClick: Story = {
  args: {
    data: sampleData,
    onRowClick: (row) => alert(`Clicked: ${JSON.stringify(row)}`),
  },
};

export const Empty: Story = {
  args: { data: [], emptyMessage: "No projects found." },
};

export const AutoColumns: Story = {
  args: { data: sampleData },
};
