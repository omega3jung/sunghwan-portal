import type { Priority, RiskLevel } from "@/domain/common";
import type { ISODateString } from "@/shared/types";

export type TicketEmailRecipients = {
  to: string[];
  cc: string[];
  bcc: string[];
};

export type TicketDraftAttachmentInput = {
  name?: string;
  type?: string;
  size?: number;
  url?: string;
};

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
