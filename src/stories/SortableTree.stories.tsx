import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  SortableTree,
  SortableTreeDragHandle,
  type TreeNodes,
} from "@/components/custom/SortableTree";
import { Button } from "@/components/ui/button";
import { NS } from "@/lib/application/i18n";

type TreeData = { labelKey: string };

const initialItems: TreeNodes<TreeData> = [
  {
    id: "workspace",
    data: { labelKey: "workspace" },
    children: [
      {
        id: "service-desk",
        data: { labelKey: "serviceDesk" },
        children: [
          { id: "tickets", data: { labelKey: "tickets" }, children: [] },
          { id: "insights", data: { labelKey: "insights" }, children: [] },
        ],
      },
    ],
  },
  {
    id: "documents",
    data: { labelKey: "documents" },
    children: [],
  },
];

const meta = {
  title: "Custom/SortableTree",
  component: SortableTree<TreeData>,
  args: {
    collapsible: true,
    disabled: false,
    indentationWidth: 24,
    items: initialItems,
    onChange: fn(),
    renderItem: () => null,
    reorderScope: "tree",
  },
  argTypes: {
    indentationWidth: { control: { type: "range", min: 16, max: 40, step: 4 } },
    renderItem: { control: false },
    reorderScope: {
      control: "radio",
      options: ["tree", "sameDepth", "siblings"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled drag-and-drop tree with visible serialized output, collapse behavior, indentation, and constrained reorder scopes.",
      },
    },
  },
} satisfies Meta<typeof SortableTree<TreeData>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();
    const { t } = useTranslation(NS.storybook, { keyPrefix: "sortableTree" });

    return (
      <div className="grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-lg border bg-card p-3">
          <SortableTree
            {...args}
            onChange={(items) => {
              updateArgs({ items });
              args.onChange(items);
            }}
            renderItem={(item, params) => {
              const label = t(`items.${item.data.labelKey}`);

              return (
                <div className="flex min-h-10 items-center gap-2 rounded-md border bg-background px-3 shadow-sm">
                  <SortableTreeDragHandle
                    aria-label={t("dragItem", { label })}
                    {...params.dragHandleProps}
                  />
                  {item.children.length > 0 && params.onCollapse ? (
                    <Button
                      aria-label={t(
                        item.collapsed ? "expandItem" : "collapseItem",
                        { label },
                      )}
                      data-testid={`tree-toggle-${item.id}`}
                      onClick={() => params.onCollapse?.(item.id)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      {item.collapsed ? <ChevronRight /> : <ChevronDown />}
                    </Button>
                  ) : (
                    <span className="size-8" />
                  )}
                  <span
                    className="text-sm font-medium"
                    data-testid={`tree-label-${item.id}`}
                  >
                    {label}
                  </span>
                </div>
              );
            }}
          />
        </div>
        <output className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 font-mono text-xs">
          {JSON.stringify(args.items, null, 2)}
        </output>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};

export const Collapsed: Story = {
  args: {
    items: initialItems.map((item, index) =>
      index === 0 ? { ...item, collapsed: true } : item,
    ),
  },
  render: Default.render,
};

export const SiblingReordering: Story = {
  args: { reorderScope: "siblings" },
  render: Default.render,
};

export const CollapseInteraction: Story = {
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId("tree-label-tickets")).toBeVisible();
    await userEvent.click(canvas.getByTestId("tree-toggle-workspace"));
    await waitFor(() => {
      expect(canvas.queryByTestId("tree-label-tickets")).not.toBeInTheDocument();
    });
  },
};
