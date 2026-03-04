import { DueDate, Priority } from "@/domain/common/types";
import { ISODateString } from "@/shared/types";

import { TicketPeriod, TicketStatus } from "./enums";

export interface FilterSetting {
  category: number[];
  status: TicketStatus[];
  assignee: string[];
  requester: string[];
  period: { type: TicketPeriod; from: ISODateString; to: ISODateString };
  dueBy: { type: DueDate; from: ISODateString; to: ISODateString };
  priority: Priority[];
  keyword: string;
}
