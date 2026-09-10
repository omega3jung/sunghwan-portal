import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { MultiComboBox } from "@/components/custom/MultiComboBox";
import { NS } from "@/lib/application/i18n";

import { multiComboBoxOptions } from "./fixtures/multiComboBox";

const badgeVariants = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
  "palette",
  "overdue",
];

const meta = {
  title: "Custom/MultiComboBox",
  component: MultiComboBox,
  args: {
    badgeVariant: "palette",
    className: "w-96",
    onRemove: fn(),
    onSelect: fn(),
    options: multiComboBoxOptions,
    paletteStart: 1,
    value: ["January", "March", "September"],
  },
  argTypes: {
    badgeOrderMap: { control: false },
    badgeVariant: { control: "select", options: badgeVariants },
    palettePick: { control: { type: "number", min: 1, max: 10, step: 1 } },
    paletteStart: { control: { type: "number", min: 1, max: 10, step: 1 } },
    size: { control: "select", options: ["default", "sm", "lg"] },
    variant: { control: "select", options: ["default", "ghost", "grayscale"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled flat multi-select. Selection, removal, badge style, and palette controls all operate on the public component contract.",
      },
    },
  },
} satisfies Meta<typeof MultiComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();
    const { t } = useTranslation(NS.storybook, { keyPrefix: "multiComboBox" });
    const localizedOptions = useMemo(
      () =>
        (args.options ?? multiComboBoxOptions).map((option) => ({
          ...option,
          label: t(`months.${option.value}`, { defaultValue: option.label }),
        })),
      [args.options, t],
    );

    return (
      <MultiComboBox
        {...args}
        options={localizedOptions}
        placeholder={args.placeholder ?? t("multiTitle")}
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

export const ReadOnly: Story = {
  args: { readOnly: true },
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
