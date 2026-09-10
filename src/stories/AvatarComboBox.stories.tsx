import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { AvatarComboBox } from "@/components/custom/AvatarComboBox";
import { avatarComboMock } from "@/mocks/ui/demo";

const meta = {
  title: "Custom/AvatarComboBox",
  component: AvatarComboBox,
  args: {
    clearable: true,
    className: "h-10 w-80",
    onChange: fn(),
    options: avatarComboMock,
    placeholder: "Select a user",
    value: null as string | null,
  },
  argTypes: {
    badgeVariant: { control: "select", options: ["default", "primary"] },
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
          "Controlled single-user selector. Controls and Canvas selection share the same value through Storybook args.",
      },
    },
  },
} satisfies Meta<typeof AvatarComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();

    return (
      <AvatarComboBox
        {...args}
        onChange={(value) => {
          updateArgs({ value });
          args.onChange?.(value);
        }}
      />
    );
  },
};

export const WithValue: Story = {
  args: { value: avatarComboMock[0].value },
  render: Default.render,
};

export const Empty: Story = {
  args: { options: [], placeholder: "No users available" },
  render: Default.render,
};

export const Disabled: Story = {
  args: { disabled: true, value: avatarComboMock[1].value },
  render: Default.render,
};

export const Loading: Story = {
  args: { isLoading: true },
  render: Default.render,
};

export const ReadOnly: Story = {
  args: { readOnly: true, value: avatarComboMock[2].value },
  render: Default.render,
};
