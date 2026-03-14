import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../src/Button";

const meta: Meta<typeof Button> = {
  title: "DS/Scalar/Button",
  component: Button,
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: "Primary Button", variant: "primary" } };
export const Secondary: Story = { args: { children: "Secondary", variant: "secondary" } };
export const Ghost: Story = { args: { children: "Ghost", variant: "ghost" } };
export const Danger: Story = { args: { children: "Delete", variant: "danger" } };
export const Small: Story = { args: { children: "Small", size: "sm" } };
export const Large: Story = { args: { children: "Large", size: "lg" } };
export const Disabled: Story = { args: { children: "Disabled", disabled: true } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};
