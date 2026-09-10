import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { MultiHierarchicalSelect } from "@/components/custom/HierarchicalSelect";
import { NS } from "@/lib/application/i18n";

import {
  getHierarchicalPathLabel,
  hierarchicalItems,
  localizeHierarchicalItems,
} from "./fixtures/hierarchicalSelect";

const meta = {
  title: "Custom/MultiHierarchicalSelect",
  component: MultiHierarchicalSelect,
  args: {
    getDisplayLabel: getHierarchicalPathLabel,
    items: hierarchicalItems,
    onValueChange: fn(),
    selectableStrategy: "parent-without-children",
    triggerClassName: "w-96",
    value: ["portal-account-login", "general"],
  },
  argTypes: {
    badgeVariant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
    getDisplayLabel: { control: false },
    selectableStrategy: {
      control: "select",
      options: ["leaf-only", "parent-without-children", "all"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled multi-value hierarchical selector with loading, read-only, and selection-strategy states.",
      },
    },
  },
} satisfies Meta<typeof MultiHierarchicalSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();
    const { t } = useTranslation(NS.storybook, {
      keyPrefix: "hierarchicalSelect",
    });
    const localizedItems = useMemo(
      () => localizeHierarchicalItems(args.items, t),
      [args.items, t],
    );

    return (
      <div className="space-y-3">
        <MultiHierarchicalSelect
          {...args}
          backLabel={args.backLabel ?? t("back")}
          emptyText={args.emptyText ?? t("noCategories")}
          items={localizedItems}
          placeholder={args.placeholder ?? t("selectCategories")}
          onValueChange={(value) => {
            updateArgs({ value });
            args.onValueChange(value);
          }}
        />
        <output className="block max-w-96 rounded-md bg-muted px-3 py-2 font-mono text-xs">
          {args.value.length > 0 ? args.value.join(", ") : t("empty")}
        </output>
      </div>
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
