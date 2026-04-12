import { DbTicketComment } from "@/api/serviceDesk/ticket/comment";

import { TICKET_2026_1 } from "./SP-2026-0001";
import { TICKET_2026_2 } from "./SP-2026-0002";
import { TICKET_2026_3 } from "./SP-2026-0003";
import { TICKET_2026_4 } from "./SP-2026-0004";

export const internalCommentsMocks: DbTicketComment[] = [
  ...TICKET_2026_1.comments,
  ...TICKET_2026_2.comments,
  ...TICKET_2026_3.comments,
  ...TICKET_2026_4.comments,
];
