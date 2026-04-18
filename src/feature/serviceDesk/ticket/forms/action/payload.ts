import type {
  TicketActionDraftFormValues,
  TicketActionPayloadValues,
} from "./types";

type BuildTicketActionPayloadParams = {
  userId: string;
  values: TicketActionDraftFormValues;
};

type ActionAttachmentPayload = TicketActionPayloadValues["files"][number];

const isImageAttachment = (file: File) => file.type.startsWith("image/");

const normalizeOptionalString = (value: string) => {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const mapAttachmentFile = (file: File): ActionAttachmentPayload => ({
  id: `${file.name}-${file.size}-${file.lastModified}`,
  name: file.name,
  size: file.size,
});

const splitActionAttachments = (attachment: File[]) => {
  return attachment.reduce<{
    files: TicketActionPayloadValues["files"];
    images: TicketActionPayloadValues["images"];
  }>(
    (acc, file) => {
      const mappedFile = mapAttachmentFile(file);

      if (isImageAttachment(file)) {
        acc.images.push(mappedFile);
        return acc;
      }

      acc.files.push(mappedFile);
      return acc;
    },
    { files: [], images: [] },
  );
};

export function buildTicketActionPayload({
  userId,
  values,
}: BuildTicketActionPayloadParams): TicketActionPayloadValues {
  const { files, images } = splitActionAttachments(values.attachment);
  const basePayload: TicketActionPayloadValues = {
    id: userId,
    actionType: values.actionType,
    content: values.content.trim(),
    files,
    images,
  };

  switch (values.actionType) {
    case "ASSIGN":
      return {
        ...basePayload,
        assigneeIds: values.assigneeIds,
        categoryId: normalizeOptionalString(values.categoryId),
      };

    case "MERGE":
      return {
        ...basePayload,
        targetTicketId: normalizeOptionalString(values.targetTicketId),
      };

    case "ADJUST":
      return {
        ...basePayload,
        priority: normalizeOptionalString(values.priority),
        riskLevel: normalizeOptionalString(values.riskLevel),
        dueAt: values.dueAt?.toISOString(),
      };

    case "COMMENT":
    case "NOTE":
    case "REJECT":
    default:
      return basePayload;
  }
}
