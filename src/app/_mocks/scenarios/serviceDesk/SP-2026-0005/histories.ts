import { DbTicketHistory } from "@/api/serviceDesk/ticket/history";

import { ticket } from "./ticket";

export const histories: DbTicketHistory[] = [
  {
    ticket_id: ticket.id,
    history_no: 1,

    type: "TICKET",
    action: "CREATED",

    actor_id: "141",
    action_no: null,

    created_at: "2026-04-02T06:03:14Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 2,

    type: "ASSIGNMENT",
    action: "UPDATED",

    actor_id: null,
    action_no: null,

    from_value: null,
    to_value: "41,31",

    created_at: "2026-04-02T06:06:20Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 3,

    type: "STATUS",
    action: "UPDATED",

    actor_id: "41",
    action_no: null,

    from_value: "Open",
    to_value: "Working",

    created_at: "2026-04-02T06:10:27Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 4,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "41",
    action_no: "1",

    created_at: "2026-04-02T06:15:48Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 5,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "141",
    action_no: "2",

    created_at: "2026-04-02T06:19:36Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 6,

    type: "NOTE",
    action: "CREATED",

    actor_id: "31",
    action_no: "3",

    created_at: "2026-04-02T06:52:08Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 7,

    type: "TRACK_TIME",
    action: "UPDATED",

    actor_id: "31",
    action_no: null,

    created_at: "2026-04-02T07:05:12Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 8,

    type: "STATUS",
    action: "UPDATED",

    actor_id: "31",
    action_no: null,

    from_value: "Working",
    to_value: "Resolved",

    metadata: {
      reason: "DB lock released and blocked transactions recovered",
    },

    created_at: "2026-04-02T07:20:31Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 9,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "31",
    action_no: "4",

    created_at: "2026-04-02T07:21:42Z",
  },
];
