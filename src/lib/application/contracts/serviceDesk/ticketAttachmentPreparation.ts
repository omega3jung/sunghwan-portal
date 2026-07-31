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

export type TicketPreparedAttachment = TicketAttachmentMetadata & {
  extension: TicketAttachmentExtension;
};

export type TicketPreparedInlineImage = TicketAttachmentMetadata & {
  extension: TicketAttachmentImageExtension;
};

export type PrepareTicketAttachmentsResponse = {
  body: string;
  files: TicketPreparedAttachment[];
  images: TicketPreparedInlineImage[];
};

export const TICKET_ATTACHMENT_REPLACEMENT_REASON: TicketAttachmentReplacementReason =
  "SECURITY_DEMO_REPLACEMENT";
