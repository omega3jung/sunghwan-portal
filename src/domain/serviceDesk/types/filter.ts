import { dueAt, Priority } from "@/domain/common/types";
import { ISODateString } from "@/shared/types";

import { TicketPeriod, TicketStatus } from "./enums";

/** Represents filter setting within the Service Desk domain. */
export interface FilterSetting {
  category: number[];
  status: TicketStatus[];
  assignee: string[];
  requester: string[];
  period: { type: TicketPeriod; from: ISODateString; to: ISODateString };
  dueBy: { type: dueAt; from: ISODateString; to: ISODateString };
  priority: Priority[];
  keyword: string;
}
