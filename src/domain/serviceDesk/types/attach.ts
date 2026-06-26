import { TicketAttach } from "./enums";

export interface Attach {
  index: number;
  type: TicketAttach;
  name: string;
  url: string;
  active: boolean;
}

export type TicketAttachmentReplacementReason = "SECURITY_DEMO_REPLACEMENT";

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
