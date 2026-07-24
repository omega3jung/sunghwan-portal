import type { Priority, RiskLevel } from "@/domain/common";
import type { TicketAttachmentMetadata } from "@/domain/serviceDesk";

export type DateInput = Date | string;

export type TicketEmailInput = {
  to: string[];
  cc: string[];
  bcc: string[];
};

export type TicketRequesterInput = {
  id: string;
  email: string;
  name: string;
};

export type TicketWriteFields = {
  category?: string;
  subject: string;
  body: string;
  dueAt: DateInput;
  priority: string | null;
  riskLevel?: string | null;
  email: TicketEmailInput;
  requester: TicketRequesterInput;
  attachment: TicketAttachmentMetadata[];
};

export type CreateTicketInput = TicketWriteFields & { id?: null };
export type UpdateTicketInput = TicketWriteFields & { id: string };

export type TicketMutateRequestPayload = {
  id?: string | null;
  tenantId?: number | null;
  categoryId: number;
  approvalStepId?: number | null;
  subject: string;
  body: string;
  dueAt: string;
  priority: Priority | null;
  riskLevel?: RiskLevel | null;
  email: TicketEmailInput;
  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
};
