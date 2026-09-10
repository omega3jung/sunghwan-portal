import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { PasswordInput } from "@/components/custom/PasswordInput";

const meta = {
  title: "Custom/PasswordInput",
  component: PasswordInput,
  args: {
    placeholder: "Enter your password",
  },
  argTypes: {
    showPasswordLabel: { control: "text" },
    hidePasswordLabel: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Password input with a localized visibility toggle and the native input prop contract.",
      },
    },
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue: "correct horse battery staple",
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "disabled password",
    disabled: true,
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: "invalid password",
    "aria-invalid": true,
  },
};

export const ReadOnly: Story = {
  args: {
    defaultValue: "read only password",
    readOnly: true,
  },
};

export const VisibilityInteraction: Story = {
  args: {
    defaultValue: "preserved password",
    showPasswordLabel: "Show password",
    hidePasswordLabel: "Hide password",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>("input");

    if (!input) {
      throw new Error("PasswordInput did not render an input");
    }

    await expect(input).toHaveAttribute("type", "password");
    await expect(input).toHaveValue("preserved password");

    await userEvent.click(
      canvas.getByRole("button", { name: "Show password" }),
    );
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveValue("preserved password");

    await userEvent.click(
      canvas.getByRole("button", { name: "Hide password" }),
    );
    await expect(input).toHaveAttribute("type", "password");
    await expect(input).toHaveValue("preserved password");
  },
};
