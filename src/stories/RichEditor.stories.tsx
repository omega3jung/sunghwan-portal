import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { RichEditor } from "@/components/custom/RichEditor";
import { NS } from "@/lib/application/i18n";

function createSampleContent(t: TFunction) {
  return `
    <h2>${t("sample.heading")}</h2>
    <p>${t("sample.paragraph")}</p>
    <ul>
      <li>${t("sample.review")}</li>
      <li>${t("sample.record")}</li>
    </ul>
  `;
}

const meta = {
  title: "Custom/RichEditor",
  component: RichEditor,
  args: {
    disabled: false,
    error: false,
    minHeight: 220,
    onChange: fn(),
    preset: "default",
    readOnly: false,
    showToolbar: true,
  },
  argTypes: {
    minHeight: { control: { type: "number", min: 120, step: 8 } },
    onEditorReady: { control: false },
    preset: {
      control: "select",
      options: ["default", "description", "comment", "action"],
    },
    toolbarHandlers: { control: false },
    toolbarLabels: { control: "object" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled Tiptap editor. Preset, dimensions, toolbar visibility, editing state, and HTML value are connected to Storybook args.",
      },
    },
  },
} satisfies Meta<typeof RichEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();
    const { t } = useTranslation(NS.storybook, { keyPrefix: "richEditor" });
    const value = args.value ?? createSampleContent(t);

    return (
      <div className="grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <RichEditor
          {...args}
          placeholder={args.placeholder ?? t("placeholder")}
          value={value}
          onChange={(value) => {
            updateArgs({ value });
            args.onChange?.(value);
          }}
        />
        <output className="max-h-80 overflow-auto whitespace-pre-wrap wrap-break-word rounded-lg border bg-muted/30 p-3 font-mono text-xs">
          {value || t("empty")}
        </output>
      </div>
    );
  },
};

export const Empty: Story = {
  args: { value: "" },
  render: Default.render,
  play: async ({ canvasElement }) => {
    // Tiptap creates its editor in a client effect when immediatelyRender is
    // disabled, so let that effect finish before querying the editable region.
    await new Promise((resolve) => window.setTimeout(resolve, 100));
    const editor = canvasElement.querySelector<HTMLElement>(
      '[contenteditable="true"]',
    );

    if (!editor) {
      throw new globalThis.Error("RichEditor did not render an editable region");
    }

    await userEvent.click(editor);
    await userEvent.paste("Controlled editor text");

    await waitFor(() => {
      expect(canvasElement.querySelector("output")).toHaveTextContent(
        "Controlled editor text",
      );
    });
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  render: Default.render,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};

export const Error: Story = {
  args: { error: true, value: "" },
  render: Default.render,
};

export const ToolbarHidden: Story = {
  args: { showToolbar: false },
  render: Default.render,
};

export const CommentPreset: Story = {
  args: {
    minHeight: 140,
    preset: "comment",
  },
  render: Default.render,
};

export const DescriptionPreset: Story = {
  args: { preset: "description" },
  render: Default.render,
};

export const ActionPreset: Story = {
  args: { minHeight: 160, preset: "action" },
  render: Default.render,
};
