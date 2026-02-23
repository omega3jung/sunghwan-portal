import { ISODateString } from "@/shared/types";

import { DueDate, Period, Priority, Status } from "./enums";

export interface FilterSetting {
  department: number[];
  category: number[];
  status: Status[];
  assignee: string[];
  requester: string[];
  period: { type: Period; from: ISODateString; to: ISODateString };
  dueBy: DueDate;
  priority: Priority[];
  keyword: string;
}
