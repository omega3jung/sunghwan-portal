import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { TFunction } from "i18next";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import {
  TreeMultiComboBox,
  type TreeMultiComboBoxOption,
} from "@/components/custom/MultiComboBox";
import { NS } from "@/lib/application/i18n";

import { treeMultiComboBoxOptions } from "./fixtures/multiComboBox";

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
  title: "Custom/TreeMultiComboBox",
  component: TreeMultiComboBox,
  args: {
    badgeVariant: "palette",
    className: "w-96",
    onChange: fn(),
    onRemove: fn(),
    onSelect: fn(),
    options: treeMultiComboBoxOptions,
    paletteStart: 1,
    value: ["apple", "salmon"],
  },
  argTypes: {
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
          "Controlled tree multi-select with compressed parent/child values and independently configurable visual props.",
      },
    },
  },
} satisfies Meta<typeof TreeMultiComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

function localizeTreeOptions(
  options: TreeMultiComboBoxOption[],
  t: TFunction,
): TreeMultiComboBoxOption[] {
  return options.map((option) => ({
    ...option,
    label: t(`items.${option.value}`, { defaultValue: option.label }),
    children: option.children.map((child) => ({
      ...child,
      label: t(`items.${child.value}`, { defaultValue: child.label }),
    })),
  }));
}

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();
    const { t } = useTranslation(NS.storybook, { keyPrefix: "multiComboBox" });
    const localizedOptions = useMemo(
      () => localizeTreeOptions(args.options ?? treeMultiComboBoxOptions, t),
      [args.options, t],
    );

    return (
      <div className="space-y-3">
        <TreeMultiComboBox
          {...args}
          options={localizedOptions}
          placeholder={args.placeholder ?? t("treeTitle")}
          onChange={(value) => {
            updateArgs({ value });
            args.onChange?.(value);
          }}
        />
        <output className="block max-w-96 rounded-md bg-muted px-3 py-2 font-mono text-xs">
          {t("treeTitle")}: {args.value.length > 0 ? args.value.join(", ") : "-"}
        </output>
      </div>
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
