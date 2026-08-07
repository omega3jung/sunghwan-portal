import type { Priority, RiskLevel } from "@/domain/common";
import type { ISODateString } from "@/shared/types";

/** Represents ticket email recipients within shared Service Desk policy. */
export type TicketEmailRecipients = {
  to: string[];
  cc: string[];
  bcc: string[];
};

/** Input contract for ticket draft attachment operations at shared Service Desk policy. */
export type TicketDraftAttachmentInput = {
  name?: string;
  type?: string;
  size?: number;
  url?: string;
};

/** Input contract for ticket draft write operations at shared Service Desk policy. */
export type TicketDraftWriteInput = {
  categoryId: string | null;
  approvalStepId?: string | null;
  priority?: Priority | null;
  riskLevel?: RiskLevel | null;
  dueAt: ISODateString;
  subject: string;
  content: string;
  email: TicketEmailRecipients;
  attachment: TicketDraftAttachmentInput[];
};
