import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  AvatarComboBox,
  AvatarMultiComboBox,
} from "@/components/custom/AvatarComboBox";
import { avatarComboMock } from "@/mocks/ui/demo";

const meta = {
  title: "Custom/AvatarComboBox",
  component: AvatarComboBox,
  parameters: {
    docs: {
      description: {
        component:
          "Single- and multi-user selectors backed by the same image/value/label option contract.",
      },
    },
  },
  args: {
    className: "w-80 h-10",
    options: avatarComboMock,
    placeholder: "Select a user",
  },
} satisfies Meta<typeof AvatarComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledSingle({ initialValue }: { initialValue: string | null }) {
  const [value, setValue] = useState<string | null>(initialValue);

  return (
    <AvatarComboBox
      clearable
      className="w-80 h-10"
      onChange={setValue}
      options={avatarComboMock}
      placeholder="Select a user"
      value={value}
    />
  );
}

function ControlledMultiple() {
  const [value, setValue] = useState<string[]>(
    avatarComboMock.slice(0, 4).map((item) => item.value),
  );

  return (
    <AvatarMultiComboBox
      className="w-80 h-10"
      maxImages={3}
      onRemove={(removed) =>
        setValue((current) => current.filter((item) => item !== removed))
      }
      onSelect={(selected) => setValue((current) => [...current, selected])}
      options={avatarComboMock}
      placeholder="Select users"
      value={value}
    />
  );
}

export const Default: Story = {
  render: () => <ControlledSingle initialValue={null} />,
};

export const WithValue: Story = {
  render: () => <ControlledSingle initialValue={avatarComboMock[0].value} />,
};

export const Empty: Story = {
  args: {
    options: [],
    placeholder: "No users available",
    value: null,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: avatarComboMock[1].value,
  },
};

export const Multiple: Story = {
  render: () => <ControlledMultiple />,
};
