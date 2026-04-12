import { DbTicketDetail } from "@/api/serviceDesk/ticket";

import { TICKET_2026_1 } from "./SP-2026-0001";
import { TICKET_2026_2 } from "./SP-2026-0002";
import { TICKET_2026_3 } from "./SP-2026-0003";
import { TICKET_2026_4 } from "./SP-2026-0004";

export const internalTicketsMocks: DbTicketDetail[] = [
  TICKET_2026_1.ticket,
  TICKET_2026_2.ticket,
  TICKET_2026_3.ticket,
  TICKET_2026_4.ticket,
];
