import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  SortableTree,
  SortableTreeDragHandle,
  type TreeNodes,
} from "@/components/custom/SortableTree";
import { Button } from "@/components/ui/button";

type TreeData = { label: string };

const initialItems: TreeNodes<TreeData> = [
  {
    id: "support",
    data: { label: "Support" },
    children: [
      { id: "triage", data: { label: "Triage" }, children: [] },
      { id: "resolution", data: { label: "Resolution" }, children: [] },
    ],
  },
  {
    id: "operations",
    data: { label: "Operations" },
    children: [
      { id: "facilities", data: { label: "Facilities" }, children: [] },
    ],
  },
];

const meta = {
  title: "Custom/SortableTree",
  component: SortableTree<TreeData>,
  args: {
    items: initialItems,
    onChange: () => undefined,
    renderItem: () => null,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled drag-and-drop tree with optional collapse behavior and constrained reorder scopes.",
      },
    },
  },
} satisfies Meta<typeof SortableTree<TreeData>>;

export default meta;
type Story = StoryObj<typeof meta>;

function TreeExample({ disabled = false }: { disabled?: boolean }) {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="max-w-xl rounded-lg border bg-card p-3">
      <SortableTree
        collapsible
        disabled={disabled}
        items={items}
        onChange={setItems}
        renderItem={(item, params) => (
          <div className="flex min-h-10 items-center gap-2 rounded-md border bg-background px-3 shadow-sm">
            <SortableTreeDragHandle
              aria-label={`Move ${item.data.label}`}
              {...params.dragHandleProps}
            />
            {item.children.length > 0 ? (
              <Button
                aria-label={`${item.collapsed ? "Expand" : "Collapse"} ${item.data.label}`}
                onClick={() => params.onCollapse?.(item.id)}
                size="icon-sm"
                variant="ghost"
              >
                {item.collapsed ? <ChevronRight /> : <ChevronDown />}
              </Button>
            ) : (
              <span className="size-8" />
            )}
            <span className="text-sm font-medium">{item.data.label}</span>
          </div>
        )}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <TreeExample />,
};

export const Disabled: Story = {
  render: () => <TreeExample disabled />,
};
