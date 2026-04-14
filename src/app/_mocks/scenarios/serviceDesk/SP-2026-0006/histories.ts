import { DbTicketHistory } from "@/api/serviceDesk/ticket/history";

import { ticket } from "./ticket";

export const histories: DbTicketHistory[] = [
  {
    ticket_id: ticket.id,
    history_no: 1,

    type: "TICKET",
    action: "CREATED",

    actor_id: "53",
    action_no: null,

    created_at: "2026-04-02T06:13:27Z",
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

    created_at: "2026-04-02T06:18:09Z",
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

    created_at: "2026-04-02T06:20:03Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 4,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "41",
    action_no: "1",

    created_at: "2026-04-02T06:22:11Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 5,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "53",
    action_no: "2",

    created_at: "2026-04-02T06:25:44Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 6,

    type: "TRACK_TIME",
    action: "UPDATED",

    actor_id: "31",
    action_no: null,

    created_at: "2026-04-02T07:09:20Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 7,

    type: "TICKET",
    action: "TICKET_MERGED",

    actor_id: "31",
    action_no: null,

    metadata: {
      sourceTicketId: ticket.id,
      targetTicketId: "sunghwan-portal-2026-5",
      reason:
        "Duplicate of the same portal performance incident already tracked in SP-2026-0005",
    },

    created_at: "2026-04-02T07:12:34Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 8,

    type: "STATUS",
    action: "UPDATED",

    actor_id: "31",
    action_no: null,

    from_value: "Working",
    to_value: "Closed",

    metadata: {
      reason:
        "Duplicate of the same portal performance incident already tracked in SP-2026-0005",
      note: "Closed as merged child ticket",
    },

    created_at: "2026-04-02T07:12:52Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 9,

    type: "TICKET",
    action: "TICKET_MERGED",

    actor_id: "31",
    action_no: "3",

    created_at: "2026-04-02T07:13:18Z",
  },
];
