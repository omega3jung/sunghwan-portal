import type { Priority, RiskLevel } from "@/domain/common";
import type { TicketAttachmentMetadata } from "@/domain/serviceDesk";

/** Input contract for date operations at the Service Desk application boundary. */
export type DateInput = Date | string;

/** Input contract for ticket email operations at the Service Desk application boundary. */
export type TicketEmailInput = {
  to: string[];
  cc: string[];
  bcc: string[];
};

/** Input contract for ticket requester operations at the Service Desk application boundary. */
export type TicketRequesterInput = {
  id: string;
  email: string;
  name: string;
};

/** Represents ticket write fields within the Service Desk application boundary. */
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

/** Input contract for create ticket operations at the Service Desk application boundary. */
export type CreateTicketInput = TicketWriteFields & { id?: null };
/** Input contract for update ticket operations at the Service Desk application boundary. */
export type UpdateTicketInput = TicketWriteFields & { id: string };

/** Represents ticket mutate request payload within the Service Desk application boundary. */
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
