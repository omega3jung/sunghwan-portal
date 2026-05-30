import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hello, Amelia and Matthew.<br>Can I updated there work log so they can see correct time?",
    owner_id: "evan_seo",

    created_at: "2026-04-25T13:15:53Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 2,

    action_type: "COMMENT",
    content:
      "Wait, Evan. We are checking job kinds. It can be extra work, not overtime work.",
    owner_id: "amelia_brown",

    created_at: "2026-04-26T00:01:58Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content: "Got it Amelia. Let me set this ticket as 'Pending' now.",
    owner_id: "evan_seo",

    created_at: "2026-04-26T01:17:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
