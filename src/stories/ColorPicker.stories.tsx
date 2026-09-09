import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { ColorPicker } from "@/components/custom/ColorPicker";

const meta = {
  title: "Custom/ColorPicker",
  component: ColorPicker,
  args: {
    onChange: () => undefined,
    value: "#0f766e",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled hex color input with a native picker, text input, and reset action.",
      },
    },
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledColorPicker({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState("#0f766e");

  return (
    <div className="max-w-md rounded-lg border p-6">
      <ColorPicker
        defaultValue="#2563eb"
        disabled={disabled}
        onChange={setValue}
        value={value}
      />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Current value: {value}
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => <ControlledColorPicker />,
};

export const Disabled: Story = {
  render: () => <ControlledColorPicker disabled />,
};

export const CompoundControls: Story = {
  render: () => {
    function CompoundExample() {
      const [value, setValue] = useState("#be123c");

      return (
        <ColorPicker onChange={setValue} value={value}>
          <ColorPicker.Trigger aria-label="Choose accent color" />
          <ColorPicker.HexInput className="w-36" />
          <ColorPicker.Reset variant="outline" />
        </ColorPicker>
      );
    }

    return <CompoundExample />;
  },
};
