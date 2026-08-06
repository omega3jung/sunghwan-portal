import { Priority, RiskLevel } from "@/domain/common";
import { Attach, TicketRequester } from "@/domain/serviceDesk";
import { ISODateString } from "@/shared/types/date";

export interface TicketDraftResource {
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
  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };
  files: Attach[];
  images: Attach[];
}
