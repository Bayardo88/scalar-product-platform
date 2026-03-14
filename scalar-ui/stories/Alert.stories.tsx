import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "../src/Alert";

const meta: Meta<typeof Alert> = {
  title: "DS/Scalar/Alert",
  component: Alert,
  argTypes: {
    variant: { control: "select", options: ["info", "success", "warning", "error"] },
  },
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: { variant: "info", title: "Information", children: "This is an informational message." },
};
export const Success: Story = {
  args: { variant: "success", title: "Success", children: "Operation completed successfully." },
};
export const Warning: Story = {
  args: { variant: "warning", title: "Warning", children: "Please review before proceeding." },
};
export const Error: Story = {
  args: { variant: "error", title: "Error", children: "Something went wrong. Please try again." },
};

export const Dismissible: Story = {
  args: { variant: "info", children: "Click the X to dismiss.", onDismiss: () => alert("Dismissed!") },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Alert variant="info">Informational alert</Alert>
      <Alert variant="success" title="Done">Changes saved.</Alert>
      <Alert variant="warning">Your session will expire soon.</Alert>
      <Alert variant="error" title="Error">Failed to save changes.</Alert>
    </div>
  ),
};
