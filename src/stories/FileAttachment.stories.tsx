import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  FileAttachment,
  type FileAttachmentErrorType,
  type FileAttachmentLimitBehavior,
} from "@/components/custom/FileAttachment";
import { NS } from "@/lib/application/i18n";

type AttachmentForm = { attachments: File[] };

type StoryArgs = {
  accept?: string[];
  initialFiles: File[];
  limitBehavior: FileAttachmentLimitBehavior;
  maxCount: number;
  maxSizeMB: number;
  onError: (type: FileAttachmentErrorType) => void;
  readOnly: boolean;
  showSeparator: boolean;
};

function FileAttachmentStory(args: StoryArgs) {
  const { t } = useTranslation(NS.storybook, { keyPrefix: "fileAttachment" });
  const form = useForm<AttachmentForm>({
    defaultValues: { attachments: args.initialFiles },
  });
  const files = useWatch({ control: form.control, name: "attachments" }) ?? [];
  const [errors, setErrors] = useState<FileAttachmentErrorType[]>([]);
  const totalSizeMB = files.reduce((sum, file) => sum + file.size, 0) /
    (1024 * 1024);

  return (
    <div className="grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
      <div className="rounded-lg border p-6">
        <FileAttachment
          accept={args.accept}
          form={form}
          limitBehavior={args.limitBehavior}
          maxCount={args.maxCount}
          maxSizeMB={args.maxSizeMB}
          name="attachments"
          readOnly={args.readOnly}
          showSeparator={args.showSeparator}
          onError={(type) => {
            setErrors((current) => [...current, type]);
            args.onError(type);
          }}
        />
      </div>
      <output className="rounded-lg border bg-muted/30 p-4 text-xs">
        <span className="block font-semibold">{t("formState")}</span>
        <span className="mt-2 block" data-testid="attachment-file-count">
          {t("files")}: {files.length}
        </span>
        <span className="block">
          {t("totalSize")}: {totalSizeMB.toFixed(3)} MB
        </span>
        <span className="block">{t("errorCount")}: {errors.length}</span>
        <span className="block">
          {t("lastError")}: {errors.length > 0
            ? t(`errors.${errors.at(-1)}`)
            : t("none")}
        </span>
      </output>
    </div>
  );
}

const sampleFile = new File(["Storybook attachment"], "project-notes.txt", {
  type: "text/plain",
});

const meta = {
  title: "Custom/FileAttachment",
  component: FileAttachmentStory,
  args: {
    accept: ["text/plain", "image/png", "application/pdf", ".md"],
    initialFiles: [],
    limitBehavior: "accept-available",
    maxCount: 3,
    maxSizeMB: 5,
    onError: fn(),
    readOnly: false,
    showSeparator: true,
  },
  argTypes: {
    accept: { control: "object" },
    initialFiles: { control: false, table: { category: "Story setup" } },
    limitBehavior: {
      control: "radio",
      options: ["accept-available", "reject-all"],
    },
    maxCount: { control: { type: "number", min: 1, step: 1 } },
    maxSizeMB: { control: { type: "number", min: 1, step: 1 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "React Hook Form attachment field with public count, size, type, limit-behavior, and read-only controls. The result panel reports controlled files and validation callbacks.",
      },
    },
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithFiles: Story = {
  args: { initialFiles: [sampleFile] },
};

export const ReadOnly: Story = {
  args: { initialFiles: [sampleFile], readOnly: true },
};

export const ImagesOnly: Story = {
  args: { accept: ["image/*"] },
};

export const RejectAllAtLimit: Story = {
  args: { limitBehavior: "reject-all", maxCount: 1 },
};

export const UploadInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>(
      'input[type="file"]',
    );

    if (!input) {
      throw new Error("FileAttachment did not render a file input");
    }

    await userEvent.upload(
      input,
      new File(["Uploaded in Storybook"], "storybook-upload.txt", {
        type: "text/plain",
      }),
    );

    await waitFor(() => {
      expect(canvas.getByTestId("attachment-file-count")).toHaveTextContent(
        "1",
      );
    });
    await expect(await canvas.findByText("storybook-upload.txt")).toBeVisible();
  },
};
