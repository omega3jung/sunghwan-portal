import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  HierarchicalSelect,
  type HierarchicalSelectItem,
  MultiHierarchicalSelect,
} from "@/components/custom/HierarchicalSelect";

const items: HierarchicalSelectItem[] = [
  {
    value: "engineering",
    label: "Engineering",
    children: [
      { value: "frontend", label: "Frontend" },
      { value: "backend", label: "Backend" },
      { value: "platform", label: "Platform" },
    ],
  },
  {
    value: "operations",
    label: "Operations",
    children: [
      { value: "service-desk", label: "Service Desk" },
      { value: "facilities", label: "Facilities", disabled: true },
    ],
  },
];

const meta = {
  title: "Custom/HierarchicalSelect",
  component: HierarchicalSelect,
  args: {
    items,
    onValueChange: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Single- and multi-value selection through a level-by-level tree navigation.",
      },
    },
  },
} satisfies Meta<typeof HierarchicalSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

function SingleExample() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <HierarchicalSelect
      items={items}
      onValueChange={setValue}
      placeholder="Choose a team"
      triggerClassName="w-80"
      value={value}
    />
  );
}

function MultipleExample({ readOnly = false }: { readOnly?: boolean }) {
  const [value, setValue] = useState(["frontend", "service-desk"]);

  return (
    <MultiHierarchicalSelect
      items={items}
      onValueChange={setValue}
      placeholder="Choose teams"
      readOnly={readOnly}
      triggerClassName="w-96"
      value={value}
    />
  );
}

export const Default: Story = {
  render: () => <SingleExample />,
};

export const WithValue: Story = {
  args: {
    triggerClassName: "w-80",
    value: "service-desk",
  },
};

export const Multiple: Story = {
  render: () => <MultipleExample />,
};

export const ReadOnly: Story = {
  render: () => <MultipleExample readOnly />,
};

export const Empty: Story = {
  args: {
    emptyText: "No teams available",
    items: [],
    placeholder: "Choose a team",
    triggerClassName: "w-80",
  },
};
