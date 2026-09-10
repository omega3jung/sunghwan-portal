import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { AvatarMultiComboBox } from "@/components/custom/AvatarComboBox";
import { NS } from "@/lib/application/i18n";

import { avatarComboBoxOptions } from "./fixtures/avatarComboBox";

const meta = {
  title: "Custom/AvatarMultiComboBox",
  component: AvatarMultiComboBox,
  args: {
    className: "h-10 w-80",
    maxImages: 3,
    onRemove: fn(),
    onSelect: fn(),
    options: avatarComboBoxOptions,
    value: avatarComboBoxOptions.slice(0, 4).map((item) => item.value),
  },
  argTypes: {
    badgeVariant: { control: "select", options: ["default", "primary"] },
    maxImages: { control: { type: "number", min: 1, step: 1 } },
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
          "Controlled multi-user selector with configurable avatar overflow and multi-value callbacks.",
      },
    },
  },
} satisfies Meta<typeof AvatarMultiComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();
    const { t } = useTranslation(NS.storybook, { keyPrefix: "avatarComboBox" });

    return (
      <AvatarMultiComboBox
        {...args}
        placeholder={args.placeholder ?? t("selectUsers")}
        onRemove={(removed) => {
          updateArgs({ value: args.value.filter((item) => item !== removed) });
          args.onRemove?.(removed);
        }}
        onSelect={(selected) => {
          if (!args.value.includes(selected)) {
            updateArgs({ value: [...args.value, selected] });
          }
          args.onSelect?.(selected);
        }}
      />
    );
  },
};

export const Empty: Story = {
  args: { value: [] },
  render: Default.render,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};

export const Loading: Story = {
  args: { isLoading: true, value: [] },
  render: Default.render,
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  render: Default.render,
};
