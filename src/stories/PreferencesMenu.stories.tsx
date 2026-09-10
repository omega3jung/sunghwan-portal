import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Settings2 } from "lucide-react";

import { PreferencesMenu } from "@/components/menu/PreferencesMenu";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Menu/PreferencesMenu",
  component: PreferencesMenu,
  parameters: {
    docs: {
      description: {
        component:
          "Application-wide presentation preferences. Stories use LOCAL persistence and do not make API requests.",
      },
    },
  },
} satisfies Meta<typeof PreferencesMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CompactTrigger: Story = {
  args: {
    trigger: ({ label }) => (
      <Button aria-label={label} size="icon" variant="outline">
        <Settings2 />
      </Button>
    ),
  },
};
