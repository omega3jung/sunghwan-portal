import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CheckCircle2, MessageCircle, UserRoundCheck } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Timeline,
  type TimelineItemData,
} from "@/components/custom/Timeline";
import { NS } from "@/lib/application/i18n";

import { timelineItems } from "./fixtures/timeline";

const markerIcons = [
  <MessageCircle key="message" />,
  <UserRoundCheck key="user" />,
  <CheckCircle2 key="check" />,
];

const items: TimelineItemData[] = timelineItems.map((item, index) => ({
    ...item,
    badge: item.id,
    description: item.id,
    markerIcon: markerIcons[index],
    meta: item.id,
    title: item.id,
}));

const meta = {
  title: "Custom/Timeline",
  component: Timeline,
  args: {
    emptyContent: null,
    items,
  },
  render: function Render(args) {
    const { t } = useTranslation(NS.storybook, { keyPrefix: "timeline" });
    const localizedItems = useMemo(
      () =>
        args.items.map((item) => ({
          ...item,
          badge:
            item.badge === undefined
              ? undefined
              : t(`items.${item.id}.badge`, { defaultValue: item.badge }),
          description:
            item.description === undefined
              ? undefined
              : t(`items.${item.id}.description`, {
                  defaultValue: item.description,
                }),
          meta:
            item.meta === undefined
              ? undefined
              : t(`items.${item.id}.meta`, { defaultValue: item.meta }),
          title: t(`items.${item.id}.title`, { defaultValue: item.title }),
        })),
      [args.items, t],
    );

    return (
      <Timeline
        {...args}
        emptyContent={args.emptyContent ?? t("emptyContent")}
        items={localizedItems}
      />
    );
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
        id: "career-2016-bkit",
        title: "career-2016-bkit",
      },
      {
        id: "career-2019-cynergy",
        title: "career-2019-cynergy",
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
