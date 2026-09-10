import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { AvatarComboBox } from "@/components/custom/AvatarComboBox";
import { NS } from "@/lib/application/i18n";

import { avatarComboBoxOptions } from "./fixtures/avatarComboBox";

const meta = {
  title: "Custom/AvatarComboBox",
  component: AvatarComboBox,
  args: {
    clearable: true,
    className: "h-10 w-80",
    onChange: fn(),
    options: avatarComboBoxOptions,
    value: null as string | null,
  },
  argTypes: {
    badgeVariant: { control: "select", options: ["default", "primary"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
    variant: {
      control: "select",
      options: ["default", "ghost", "readOnly"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled single-user selector. Controls and Canvas selection share the same value through Storybook args.",
      },
    },
  },
} satisfies Meta<typeof AvatarComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();
    const { t } = useTranslation(NS.storybook, { keyPrefix: "avatarComboBox" });

    return (
      <AvatarComboBox
        {...args}
        placeholder={args.placeholder ?? t("selectUser")}
        onChange={(value) => {
          updateArgs({ value });
          args.onChange?.(value);
        }}
      />
    );
  },
};

export const WithValue: Story = {
  args: { value: avatarComboBoxOptions[0].value },
  render: Default.render,
};

export const Empty: Story = {
  args: { options: [] },
  render: Default.render,
};

export const Disabled: Story = {
  args: { disabled: true, value: avatarComboBoxOptions[1].value },
  render: Default.render,
};

export const Loading: Story = {
  args: { isLoading: true },
  render: Default.render,
};

export const ReadOnly: Story = {
  args: { readOnly: true, value: avatarComboBoxOptions[2].value },
  render: Default.render,
};
