import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Form, TextInput, PasswordInput, Select, SearchInput } from "../src/Form";
import { Button } from "../src/Button";

const meta: Meta<typeof Form> = {
  title: "DS/Scalar/Form",
  component: Form,
};
export default meta;
type Story = StoryObj<typeof Form>;

export const LoginForm: Story = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <Form onSubmit={(e) => { e.preventDefault(); alert("Submitted!"); }}>
        <TextInput label="Email" placeholder="you@example.com" />
        <PasswordInput label="Password" placeholder="Enter password" />
        <Button type="submit">Sign In</Button>
      </Form>
    </div>
  ),
};

export const TextInputStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 320 }}>
      <TextInput label="Default" placeholder="Type here..." />
      <TextInput label="With Error" error="This field is required" />
      <TextInput label="Disabled" disabled placeholder="Disabled" />
    </div>
  ),
};

export const SelectInput: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Select
        label="Status"
        options={[
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "archived", label: "Archived" },
        ]}
      />
    </div>
  ),
};

export const Search: Story = {
  render: () => <SearchInput placeholder="Search projects..." onSearch={(v) => console.log("Search:", v)} />,
};
