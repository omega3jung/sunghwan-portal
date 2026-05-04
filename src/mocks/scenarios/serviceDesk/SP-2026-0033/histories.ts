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

    created_at: "2026-03-27T01:14:33Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 2,

    type: "APPROVAL",
    action: "APPROVAL_REQUESTED",

    actor_id: null,
    action_no: null,

    created_at: "2026-03-27T01:14:34Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 3,

    type: "APPROVAL",
    action: "APPROVAL_APPROVED",

    actor_id: "52",
    action_no: null,

    created_at: "2026-03-27T01:20:05Z",
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

    created_at: "2026-03-27T01:20:06Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 5,

    type: "STATUS",
    action: "UPDATED",

    actor_id: "41",
    action_no: null,

    from_value: "Open",
    to_value: "Working",

    created_at: "2026-03-27T01:21:10Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 6,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "41",
    action_no: "1",

    created_at: "2026-03-27T01:23:18Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 7,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "53",
    action_no: "2",

    created_at: "2026-03-27T01:40:42Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 8,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "41",
    action_no: "3",

    created_at: "2026-03-30T01:12:20Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 9,

    type: "ASSIGNMENT",
    action: "UPDATED",

    actor_id: "41",
    action_no: null,

    from_value: "41",
    to_value: "41,43",

    created_at: "2026-03-30T01:12:55Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 10,

    type: "NOTE",
    action: "CREATED",

    actor_id: "43",
    action_no: "4",

    created_at: "2026-03-30T01:48:10Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 11,

    type: "TRACK_TIME",
    action: "UPDATED",

    actor_id: "43",
    action_no: null,

    created_at: "2026-03-30T02:02:00Z",
  },
];
