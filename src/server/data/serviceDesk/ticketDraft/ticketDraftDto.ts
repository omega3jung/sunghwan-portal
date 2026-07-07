import { Priority, RiskLevel } from "@/domain/common";
import { Attach } from "@/domain/serviceDesk";
import { ISODateString } from "@/shared/types";

import { ServiceDeskTicketEmail } from "../ticket/ticketRow";

export type TicketDraftAttachmentInputDto = {
  name?: string;
  type?: string;
  size?: number;
  url?: string;
};

export type TicketDraftDto = {
  id: string;
  ticketNo: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  requesterUsername: string;
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

export type TicketDraftWriteDto = {
  categoryId: string | null;
  approvalStepId?: string | null;
  priority?: Priority | null;
  riskLevel?: RiskLevel | null;
  dueAt: ISODateString;
  subject: string;
  content: string;
  email: ServiceDeskTicketEmail;
  attachment: TicketDraftAttachmentInputDto[];
};
