import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fireEvent, fn, within } from "storybook/test";

import { ColorPicker } from "@/components/custom/ColorPicker";

const meta = {
  title: "Custom/ColorPicker",
  component: ColorPicker,
  args: {
    defaultValue: "#2563eb",
    onChange: fn(),
    placeholder: "#000000",
    value: "#0f766e",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled hex color input with a native picker, text input, reset action, and optional compound composition.",
      },
    },
  },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();

    return (
      <div className="max-w-md rounded-lg border p-6">
        <ColorPicker
          {...args}
          onChange={(value) => {
            updateArgs({ value });
            args.onChange(value);
          }}
        />
        <output className="mt-4 block text-center text-sm text-muted-foreground">
          Current value: {args.value}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    fireEvent.change(input, { target: { value: "#1d4ed8" } });

    await expect(
      await canvas.findByText("Current value: #1d4ed8"),
    ).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};

export const CompoundControls: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();

    return (
      <ColorPicker
        {...args}
        onChange={(value) => {
          updateArgs({ value });
          args.onChange(value);
        }}
      >
        <ColorPicker.Trigger aria-label="Choose accent color" />
        <ColorPicker.HexInput className="w-36" />
        <ColorPicker.Reset variant="outline" />
      </ColorPicker>
    );
  },
};
