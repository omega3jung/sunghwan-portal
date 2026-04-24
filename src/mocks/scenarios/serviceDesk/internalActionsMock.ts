import { DbTicketAction } from "@/feature/serviceDesk/ticketAction";

import { TICKET_2026_1 } from "./SP-2026-0001";
import { TICKET_2026_2 } from "./SP-2026-0002";
import { TICKET_2026_3 } from "./SP-2026-0003";
import { TICKET_2026_4 } from "./SP-2026-0004";
import { TICKET_2026_5 } from "./SP-2026-0005";
import { TICKET_2026_6 } from "./SP-2026-0006";

export const internalActionsMocks: DbTicketAction[] = [
  ...TICKET_2026_1.actions,
  ...TICKET_2026_2.actions,
  ...TICKET_2026_3.actions,
  ...TICKET_2026_4.actions,
  ...TICKET_2026_5.actions,
  ...TICKET_2026_6.actions,
];
