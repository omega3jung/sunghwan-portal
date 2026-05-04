import { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory/api";

import { ticket } from "./ticket";

export const histories: DbTicketHistory[] = [
  {
    ticket_id: ticket.id,
    history_no: 1,

    type: "TICKET",
    action: "CREATED",

    actor_id: "53",
    action_no: null,

    created_at: "2026-03-27T02:44:33Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 2,

    type: "APPROVAL",
    action: "APPROVAL_REQUESTED",

    actor_id: null,
    action_no: null,

    created_at: "2026-03-27T02:44:34Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 3,

    type: "APPROVAL",
    action: "APPROVAL_APPROVED",

    actor_id: "52",
    action_no: null,

    created_at: "2026-03-27T08:07:18Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 4,

    type: "ASSIGNMENT",
    action: "UPDATED",

    actor_id: null,
    action_no: null,

    from_value: null,
    to_value: "41",

    created_at: "2026-03-27T08:07:19Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 5,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "41",
    action_no: "1",

    created_at: "2026-03-27T08:20:00Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 6,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "53",
    action_no: "2",

    created_at: "2026-03-27T08:41:12Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 7,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "41",
    action_no: "3",

    created_at: "2026-03-27T09:15:11Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 8,

    type: "STATUS",
    action: "UPDATED",

    actor_id: "41",
    action_no: null,

    from_value: "Working",
    to_value: "Resolved",

    created_at: "2026-03-27T09:15:28Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 9,

    type: "TRACK_TIME",
    action: "UPDATED",

    actor_id: "41",
    action_no: null,

    created_at: "2026-03-27T09:18:42Z",
  },
];
