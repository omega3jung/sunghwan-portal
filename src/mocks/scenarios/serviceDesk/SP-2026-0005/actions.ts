import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hello, Grant.<br>We are checking the transaction flow now.<br>Please confirm whether this affects only one user or the whole logistics team.",
    owner_id: "evan_seo",

    created_at: "2026-04-02T06:15:48Z",
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
      "This affects the whole outbound shipping team.<br>Different users tried it and all of them are stuck with the loading spinner.",
    owner_id: "grant_murphy",

    created_at: "2026-04-02T06:19:36Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "NOTE",
    content:
      "Found the root cause.<br>A DB lock on the shipping transaction path is blocking requests from completing.<br>I am clearing the blocked session and verifying that pending transactions recover normally.",
    owner_id: "daniel_kim",

    created_at: "2026-04-02T06:52:08Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,

    action_no: 4,

    action_type: "COMMENT",
    content:
      "Update: the DB lock has been resolved and outbound shipping is processing normally again.<br>Please refresh the page and retry the transaction.<br>No additional data correction is required on our side.",
    owner_id: "daniel_kim",

    created_at: "2026-04-02T07:21:42Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
