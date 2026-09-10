import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RouteLoadingOverlay } from "@/components/layout/RouteLoading/RouteLoadingOverlay";

const meta = {
  title: "Layout/RouteLoading",
  component: RouteLoadingOverlay,
  args: {
    label: "Loading…",
    visible: true,
  },
  parameters: {
    docs: {
      description: {
        component:
          "The user-visible route transition overlay. The provider remains application infrastructure.",
      },
    },
  },
} satisfies Meta<typeof RouteLoadingOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {};

export const WithContent: Story = {
  render: (args) => (
    <div className="grid min-h-[420px] place-items-center rounded-lg border bg-card">
      <div className="max-w-sm space-y-3 text-center">
        <h2 className="text-xl font-semibold">Ticket details</h2>
        <p className="text-sm text-muted-foreground">
          Existing page content remains visible beneath the transition overlay.
        </p>
      </div>
      <RouteLoadingOverlay {...args} />
    </div>
  ),
};
