import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "../src/Modal";
import { Button } from "../src/Button";
import { TextInput } from "../src/Form";

const meta: Meta<typeof Modal> = {
  title: "DS/Scalar/Modal",
  component: Modal,
};
export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Create Project">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TextInput label="Project Name" placeholder="My Project" />
            <TextInput label="Description" placeholder="Optional description" />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Create</Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};
