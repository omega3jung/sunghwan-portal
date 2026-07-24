import type { LocalizedName } from "@/domain/organization";
import { ISODateString } from "@/shared/types/date";

import { Attach } from "../../types";
import { TicketActionType } from "./types";

/**
 * Ticket action domain model.
 *
 * actionNo is ticket-scoped, not globally unique.
 * Recommended identity: (ticketId, actionNo)
 */
export interface TicketAction {
  ticketId: string;
  actionNo: number;

  actionType: TicketActionType;
  content: string;
  ownerUsername: string | null;
  ownerName: LocalizedName | null;

  createdAt: ISODateString;
  updatedAt?: ISODateString;
  active: boolean;

  files: Attach[];
  images: Attach[];
}
