import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  MultiComboBox,
  TreeMultiComboBox,
} from "@/components/custom/MultiComboBox";
import {
  multiComboBoxMocks,
  treeMultiComboBoxMocks,
} from "@/mocks/ui/demo";

const meta = {
  title: "Custom/MultiComboBox",
  component: MultiComboBox,
  args: {
    options: multiComboBoxMocks,
    placeholder: "Select months",
    value: [],
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled multi-selects for flat option lists and nested tree options.",
      },
    },
  },
} satisfies Meta<typeof MultiComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

function FlatExample({ readOnly = false }: { readOnly?: boolean }) {
  const [value, setValue] = useState(["January", "March", "September"]);

  return (
    <MultiComboBox
      badgeVariant="palette"
      className="w-96"
      onRemove={(removed) =>
        setValue((current) => current.filter((item) => item !== removed))
      }
      onSelect={(selected) =>
        setValue((current) => [...current, selected])
      }
      options={multiComboBoxMocks}
      placeholder="Select months"
      readOnly={readOnly}
      value={value}
    />
  );
}

function TreeExample() {
  const [value, setValue] = useState<string[]>(["apple", "salmon"]);

  return (
    <TreeMultiComboBox
      className="w-96"
      onChange={setValue}
      options={treeMultiComboBoxMocks}
      placeholder="Select food groups"
      value={value}
    />
  );
}

export const Default: Story = {
  render: () => <FlatExample />,
};

export const Empty: Story = {};

export const ReadOnly: Story = {
  render: () => <FlatExample readOnly />,
};

export const Loading: Story = {
  args: {
    className: "w-96",
    isLoading: true,
    value: ["January", "February"],
  },
};

export const Tree: Story = {
  render: () => <TreeExample />,
};
