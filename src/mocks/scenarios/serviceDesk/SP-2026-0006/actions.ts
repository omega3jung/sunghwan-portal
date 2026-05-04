import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hello, Liam.<br>We are checking this issue with the backend team now.<br>Please confirm which process steps are blocked for the repair team.",
    owner_id: "41",

    created_at: "2026-04-02T06:22:11Z",
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
      "Receiving, repair, and QC are all blocked.<br>Every affected screen keeps showing only the loading icon and users cannot continue.",
    owner_id: "53",

    created_at: "2026-04-02T06:25:44Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "MERGE",
    content:
      "This ticket has been merged into SP-2026-0005 because it is the same incident caused by the same DB lock.<br>Further tracking and communication will continue in the representative ticket.",
    owner_id: "31",

    created_at: "2026-04-02T07:13:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
