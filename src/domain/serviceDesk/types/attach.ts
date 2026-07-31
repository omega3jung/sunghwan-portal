import { TicketAttach } from "./enums";

/** Represents attach within the Service Desk domain. */
export interface Attach {
  index: number;
  type: TicketAttach;
  name: string;
  url: string;
  active: boolean;
}

/** Marker proving an attachment was replaced by controlled demo metadata. */
export type TicketAttachmentReplacementReason = "SECURITY_DEMO_REPLACEMENT";

/** JSON-safe metadata for a controlled demo attachment replacement. */
export type TicketAttachmentMetadata = {
  originalName: string;
  replacedName: string;
  extension: string;
  size: number;
  type: string;
  demoUrl: string;
  replaced: true;
  reason: TicketAttachmentReplacementReason;
};
