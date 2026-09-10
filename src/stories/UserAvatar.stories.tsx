import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { UserAvatar } from "@/components/custom/UserAvatar";

const meta = {
  title: "Custom/UserAvatar",
  component: UserAvatar,
  args: {
    className: "size-14",
    name: "Alex Kim",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Application avatar contract with a localized-name-friendly initials fallback.",
      },
    },
  },
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const WithImage: Story = {
  args: {
    image: "/_mocks/avatar/female-01.png",
    name: "Emily Johnson",
  },
};

export const BrokenImageFallback: Story = {
  args: {
    image: "/missing-avatar.png",
    name: "Fallback User",
  },
};
