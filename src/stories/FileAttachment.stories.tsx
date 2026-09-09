import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";

import { FileAttachment } from "@/components/custom/FileAttachment";

type AttachmentForm = {
  attachments: File[];
};

function AttachmentExample({ readOnly = false }: { readOnly?: boolean }) {
  const form = useForm<AttachmentForm>({
    defaultValues: {
      attachments: [
        new File(["Storybook attachment"], "project-notes.txt", {
          type: "text/plain",
        }),
      ],
    },
  });

  return (
    <div className="max-w-2xl rounded-lg border p-6">
      <FileAttachment
        accept={["text/plain", "image/png", "application/pdf"]}
        form={form}
        maxCount={4}
        maxSizeMB={10}
        name="attachments"
        readOnly={readOnly}
      />
    </div>
  );
}

const meta = {
  title: "Custom/FileAttachment",
  component: AttachmentExample,
  parameters: {
    docs: {
      description: {
        component:
          "React Hook Form attachment field with drop, count/size validation, list, and read-only presentation.",
      },
    },
  },
} satisfies Meta<typeof AttachmentExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
  },
};
