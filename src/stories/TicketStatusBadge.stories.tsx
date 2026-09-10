import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { TicketStatus } from "@/domain/serviceDesk";
import { TicketStatusBadge } from "@/feature/serviceDesk/shared/components";

const statuses: TicketStatus[] = [
  "Draft",
  "Approval",
  "Declined",
  "Assigned",
  "Working",
  "Pending",
  "Rejected",
  "Resolved",
  "Closed",
];

const meta = {
  title: "ServiceDesk/TicketStatusBadge",
  component: TicketStatusBadge,
  args: {
    status: "Working",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Visual mapping for the canonical Service Desk ticket status union.",
      },
    },
  },
} satisfies Meta<typeof TicketStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-wrap gap-3">
      {statuses.map((status) => (
        <TicketStatusBadge key={status} status={status} />
      ))}
    </div>
  ),
};
