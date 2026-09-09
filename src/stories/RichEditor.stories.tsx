import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { RichEditor } from "@/components/custom/RichEditor";

const INITIAL_CONTENT = `
  <h2>Service desk handoff</h2>
  <p>Use the editor for <strong>structured notes</strong>, links, and lists.</p>
  <ul><li>Confirm the requester</li><li>Record the resolution</li></ul>
`;

const meta = {
  title: "Custom/RichEditor",
  component: RichEditor,
  args: {
    minHeight: 220,
    placeholder: "Write a note…",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled Tiptap editor presets used by descriptions, comments, and actions.",
      },
    },
  },
} satisfies Meta<typeof RichEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledEditor() {
  const [value, setValue] = useState(INITIAL_CONTENT);

  return (
    <div className="max-w-3xl">
      <RichEditor
        minHeight={240}
        onChange={setValue}
        placeholder="Write a service desk note…"
        value={value}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <ControlledEditor />,
};

export const Empty: Story = {
  args: {
    value: "",
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    value: INITIAL_CONTENT,
  },
};

export const Error: Story = {
  args: {
    error: "A description is required",
    value: "",
  },
};

export const CommentPreset: Story = {
  args: {
    minHeight: 140,
    preset: "comment",
    value: "<p>A compact editor for a ticket comment.</p>",
  },
};
