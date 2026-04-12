import { DbTicketHistory } from "@/api/serviceDesk/ticket/history";

import { TICKET_2026_1 } from "./SP-2026-0001";
import { TICKET_2026_2 } from "./SP-2026-0002";
import { TICKET_2026_3 } from "./SP-2026-0003";
import { TICKET_2026_4 } from "./SP-2026-0004";

export const internalHistoriesMocks: DbTicketHistory[] = [
  ...TICKET_2026_1.histories,
  ...TICKET_2026_2.histories,
  ...TICKET_2026_3.histories,
  ...TICKET_2026_4.histories,
];
