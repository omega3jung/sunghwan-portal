import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RouteLoadingOverlay } from "@/components/layout/RouteLoading/RouteLoadingOverlay";

const meta = {
  title: "Layout/RouteLoading",
  component: RouteLoadingOverlay,
  args: {
    label: "Navigating…",
    visible: true,
    progress: 0.55,
    completing: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Non-blocking simulated route progress. Destination data loading remains local to each page's skeletons. Progress is not a measured percentage.",
      },
    },
  },
} satisfies Meta<typeof RouteLoadingOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completing: Story = {
  args: { progress: 1, completing: true },
};

export const Loading: Story = {
  render: (args) => (
    <div className="grid min-h-[420px] place-items-center rounded-lg border bg-card">
      <div className="max-w-sm space-y-3 text-center">
        <h2 className="text-xl font-semibold">Ticket details</h2>
        <p className="text-sm text-muted-foreground">
          Navigation stays usable while the next route loads.
        </p>
      </div>
      <RouteLoadingOverlay {...args} />
    </div>
  ),
};
