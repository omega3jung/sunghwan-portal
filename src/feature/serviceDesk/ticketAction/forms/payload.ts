import type { PrepareTicketAttachmentsResponse } from "@/feature/serviceDesk/ticket/write";

import type {
  TicketActionDraftFormValues,
  TicketActionPayloadValues,
} from "./types";

type BuildTicketActionPayloadParams = {
  userId: string;
  values: TicketActionDraftFormValues;
  prepared?: PrepareTicketAttachmentsResponse;
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

const mapPreparedAttachment = (
  attachment: PrepareTicketAttachmentsResponse["files"][number],
): ActionAttachmentPayload => ({
  id: `${attachment.replacedName}-${attachment.size}`,
  name: attachment.originalName,
  size: attachment.size,
  url: attachment.demoUrl,
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

const resolveActionAttachments = (
  values: TicketActionDraftFormValues,
  prepared?: PrepareTicketAttachmentsResponse,
) => {
  if (prepared) {
    return {
      files: prepared.files.map(mapPreparedAttachment),
      images: prepared.images.map(mapPreparedAttachment),
    };
  }

  return splitActionAttachments(values.attachment);
};

export function buildTicketActionPayload({
  userId,
  values,
  prepared,
}: BuildTicketActionPayloadParams): TicketActionPayloadValues {
  const { files, images } = resolveActionAttachments(values, prepared);
  const basePayload: TicketActionPayloadValues = {
    id: userId,
    actionType: values.actionType,
    content: (prepared?.body ?? values.content).trim(),
    files,
    images,
  };

  switch (values.actionType) {
    case "APPROVE":
    case "DECLINE":
      return {
        ...basePayload,
        files: [],
        images: [],
      };

    case "ASSIGN":
      return {
        ...basePayload,
        assigneeUsernames: values.assigneeUsernames,
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
