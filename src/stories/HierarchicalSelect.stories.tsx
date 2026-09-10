import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { HierarchicalSelect } from "@/components/custom/HierarchicalSelect";
import { NS } from "@/lib/application/i18n";

import {
  getHierarchicalPathLabel,
  hierarchicalItems,
  localizeHierarchicalItems,
} from "./fixtures/hierarchicalSelect";

const meta = {
  title: "Custom/HierarchicalSelect",
  component: HierarchicalSelect,
  args: {
    getDisplayLabel: getHierarchicalPathLabel,
    items: hierarchicalItems,
    onValueChange: fn(),
    selectableStrategy: "parent-without-children",
    triggerClassName: "w-80",
    value: null as string | null,
  },
  argTypes: {
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
          "Controlled single-value selection through level-by-level tree navigation, including configurable selection strategy and path labels.",
      },
    },
  },
} satisfies Meta<typeof HierarchicalSelect>;

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
        <HierarchicalSelect
          {...args}
          backLabel={args.backLabel ?? t("back")}
          emptyText={args.emptyText ?? t("noCategories")}
          items={localizedItems}
          placeholder={args.placeholder ?? t("selectCategory")}
          onValueChange={(value) => {
            updateArgs({ value });
            args.onValueChange(value);
          }}
        />
        <output className="block max-w-80 rounded-md bg-muted px-3 py-2 font-mono text-xs">
          {args.value ?? t("empty")}
        </output>
      </div>
    );
  },
};

export const WithValue: Story = {
  args: { value: "portal-account-login" },
  render: Default.render,
};

export const Empty: Story = {
  args: { items: [] },
  render: Default.render,
};

export const Disabled: Story = {
  args: { disabled: true, value: "portal-account-profile" },
  render: Default.render,
};

export const LeafOnly: Story = {
  args: { selectableStrategy: "leaf-only" },
  render: Default.render,
};
