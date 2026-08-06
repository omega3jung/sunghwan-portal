import { TicketAttach } from "./enums";

export interface Attach {
  index: number;
  type: TicketAttach;
  name: string;
  url: string;
  active: boolean;
}

/** Marker proving an attachment was replaced by controlled demo metadata. */
export type TicketAttachmentReplacementReason = "SECURITY_DEMO_REPLACEMENT";

/** JSON-safe metadata retained for a controlled demo attachment replacement. */
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
