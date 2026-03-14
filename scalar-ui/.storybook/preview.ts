import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#fafafa" },
        { name: "white", value: "#ffffff" },
        { name: "dark", value: "#16161f" },
      ],
    },
  },
};

export default preview;
