import type { Priority, RiskLevel } from "@/domain/common";
import type { ISODateString } from "@/shared/types";

/** Category is the minimum identity required to persist a draft in either runtime. */
export function hasTicketDraftCategory(categoryId: unknown): categoryId is string {
  return typeof categoryId === "string" && /^[1-9]\d*$/.test(categoryId);
}

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
