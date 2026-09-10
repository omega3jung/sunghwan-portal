import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { TicketHistory } from "@/domain/serviceDesk";
import { TicketHistoryTimeline } from "@/feature/serviceDesk/ticketHistory/components";

const actorName = {
  en: { first: "Alex", last: "Kim" },
  ko: { first: "서준", last: "김" },
};

const items = [
  {
    actionNo: null,
    actorName,
    actorUsername: "alex.kim",
    createdAt: "2026-09-09T00:10:00.000Z",
    event: "TICKET_SUBMITTED",
    historyNo: 1,
    metadata: null,
    source: "USER_ACTION",
    ticketId: "ticket-2026-42",
    type: "TICKET",
  },
  {
    actionNo: null,
    actorName: null,
    actorUsername: null,
    createdAt: "2026-09-09T00:12:00.000Z",
    event: "ASSIGNMENT_RESOLVED",
    historyNo: 2,
    metadata: null,
    source: "ROUTING_RULE",
    ticketId: "ticket-2026-42",
    type: "ASSIGNMENT",
  },
  {
    actionNo: 3,
    actorName,
    actorUsername: "alex.kim",
    createdAt: "2026-09-09T05:35:00.000Z",
    event: "STATUS_UPDATED",
    fromValue: "Working",
    historyNo: 3,
    metadata: { note: "Requester confirmed that access is working." },
    source: "USER_ACTION",
    ticketId: "ticket-2026-42",
    toValue: "Resolved",
    type: "STATUS",
  },
] satisfies TicketHistory[];

const meta = {
  title: "ServiceDesk/TicketHistoryTimeline",
  component: TicketHistoryTimeline,
  args: {
    className: "h-[430px] w-full max-w-xl rounded-lg border",
    items,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Presentational ticket history using the existing domain model and application mapping.",
      },
    },
  },
} satisfies Meta<typeof TicketHistoryTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
  args: {
    compact: false,
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    items: undefined,
  },
};
