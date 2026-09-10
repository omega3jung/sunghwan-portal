import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CheckCircle2, MessageCircle, UserRoundCheck } from "lucide-react";

import {
  Timeline,
  type TimelineItemData,
} from "@/components/custom/Timeline";

const items: TimelineItemData[] = [
  {
    id: "created",
    badge: "Created",
    description: "The requester submitted a new access request.",
    markerIcon: <MessageCircle />,
    meta: "Alex Kim · Sep 9, 09:10",
    palette: 2,
    title: "Ticket submitted",
  },
  {
    id: "assigned",
    badge: "Assigned",
    description: "The ticket was assigned to the Platform team.",
    markerIcon: <UserRoundCheck />,
    meta: "Routing rule · Sep 9, 09:12",
    palette: 4,
    title: "Owner assigned",
  },
  {
    id: "resolved",
    badge: "Resolved",
    description: "Access was granted and verified with the requester.",
    markerIcon: <CheckCircle2 />,
    meta: "Sam Lee · Sep 9, 14:35",
    palette: 6,
    title: "Request resolved",
  },
];

const meta = {
  title: "Custom/Timeline",
  component: Timeline,
  args: {
    emptyContent: "No activity yet.",
    items,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Presentation-only timeline for ordered activity and history display models.",
      },
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Ascending: Story = {
  args: {
    order: "asc",
  },
};

export const Compact: Story = {
  args: {
    compact: true,
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const MinimalItems: Story = {
  args: {
    items: [
      {
        id: "created",
        title: "Ticket submitted",
      },
      {
        id: "assigned",
        title: "Owner assigned",
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Timeline items only require an id and title; badge, description, meta, palette, and marker icon are optional.",
      },
    },
  },
};
