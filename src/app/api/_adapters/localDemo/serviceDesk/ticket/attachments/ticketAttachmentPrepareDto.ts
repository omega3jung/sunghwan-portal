import type {
  TicketAttachmentMetadata,
  TicketAttachmentReplacementReason,
} from "@/domain/serviceDesk";

export type TicketAttachmentExtension =
  | "jpg"
  | "jpeg"
  | "png"
  | "gif"
  | "webp"
  | "txt"
  | "log"
  | "csv"
  | "json"
  | "xlsx"
  | "docx"
  | "pptx"
  | "pdf"
  | "zip"
  | "7z";

export type TicketAttachmentImageExtension = Extract<
  TicketAttachmentExtension,
  "jpg" | "jpeg" | "png" | "gif" | "webp"
>;

export type TicketPreparedAttachmentDto = TicketAttachmentMetadata & {
  extension: TicketAttachmentExtension;
};

export type TicketPreparedInlineImageDto = TicketAttachmentMetadata & {
  extension: TicketAttachmentImageExtension;
};

export type PrepareTicketAttachmentsResponseDto = {
  body: string;
  files: TicketPreparedAttachmentDto[];
  images: TicketPreparedInlineImageDto[];
};

export type TicketAttachmentPrepareInput = {
  body: string;
  files: File[];
};

export const TICKET_ATTACHMENT_REPLACEMENT_REASON: TicketAttachmentReplacementReason =
  "SECURITY_DEMO_REPLACEMENT";
