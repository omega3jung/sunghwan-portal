import type {
  TicketAttachmentMetadata,
  TicketAttachmentReplacementReason,
} from "@/domain/serviceDesk";

/** Represents ticket attachment extension within the Service Desk application boundary. */
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

/** Represents ticket attachment image extension within the Service Desk application boundary. */
export type TicketAttachmentImageExtension = Extract<
  TicketAttachmentExtension,
  "jpg" | "jpeg" | "png" | "gif" | "webp"
>;

/** Represents ticket prepared attachment within the Service Desk application boundary. */
export type TicketPreparedAttachment = TicketAttachmentMetadata & {
  extension: TicketAttachmentExtension;
};

/** Represents ticket prepared inline image within the Service Desk application boundary. */
export type TicketPreparedInlineImage = TicketAttachmentMetadata & {
  extension: TicketAttachmentImageExtension;
};

/** Response contract returned by prepare ticket attachments operations at the Service Desk application boundary. */
export type PrepareTicketAttachmentsResponse = {
  body: string;
  files: TicketPreparedAttachment[];
  images: TicketPreparedInlineImage[];
};

/** Defines the ticket attachment replacement reason policy value used by the Service Desk application boundary. */
export const TICKET_ATTACHMENT_REPLACEMENT_REASON: TicketAttachmentReplacementReason =
  "SECURITY_DEMO_REPLACEMENT";
