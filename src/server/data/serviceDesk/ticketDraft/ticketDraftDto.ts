import { Priority, RiskLevel } from "@/domain/common";
import { Attach, TicketRequester } from "@/domain/serviceDesk";
import type {
  TicketDraftAttachmentInput,
  TicketDraftWriteInput,
} from "@/lib/application/serviceDesk";
import { ISODateString } from "@/shared/types";

import { ServiceDeskTicketEmail } from "../ticket/ticketRow";

/** Defines the ticket draft attachment input dto exchanged across the server API boundary. */
export type TicketDraftAttachmentInputDto = TicketDraftAttachmentInput;

/** Defines the ticket draft dto exchanged across the server API boundary. */
export type TicketDraftDto = {
  id: string;
  ticketNo: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  requester: TicketRequester;
  status: "Draft";
  active: boolean;
  categoryId: string | null;
  approvalStepId: string | null;
  priority: Priority;
  riskLevel: RiskLevel;
  assigneeUsernames: string[];
  dueAt: ISODateString;
  subject: string;
  content: string;
  email: ServiceDeskTicketEmail;
  files: Attach[];
  images: Attach[];
};

/** Defines the ticket draft write dto exchanged across the server API boundary. */
export type TicketDraftWriteDto = TicketDraftWriteInput;
