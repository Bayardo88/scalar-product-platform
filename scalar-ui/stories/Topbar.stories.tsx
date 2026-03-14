import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Topbar } from "../src/Topbar";
import { SearchInput } from "../src/Form";
import { Button } from "../src/Button";

const meta: Meta<typeof Topbar> = {
  title: "DS/Scalar/Topbar",
  component: Topbar,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Topbar>;

export const Default: Story = {
  args: { title: "Dashboard" },
};

export const WithActions: Story = {
  render: () => (
    <Topbar title="Projects">
      <SearchInput placeholder="Search projects..." />
      <Button size="sm">Create Project</Button>
    </Topbar>
  ),
};
