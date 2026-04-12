import { DbTicketHistory } from "@/api/serviceDesk/ticket/history";

import { ticket } from "./ticket";

export const histories: DbTicketHistory[] = [
  {
    ticket_id: ticket.id,
    history_no: 1,

    type: "SYSTEM",
    action: "CREATED",

    actor_id: "52",
    comment_no: null,

    created_at: "2026-03-31T16:25:38Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 2,

    type: "ASSIGNMENT",
    action: "ASSIGNEE_CHANGED",

    actor_id: null,
    comment_no: null,

    from_value: null,
    to_value: "41",

    created_at: "2026-03-31T16:31:12Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 3,

    type: "STATUS",
    action: "STATUS_CHANGED",

    actor_id: "41",
    comment_no: null,

    from_value: "Open",
    to_value: "Working",

    created_at: "2026-03-31T16:44:05Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 4,

    type: "COMMENT",
    action: "COMMENT_CREATED",

    actor_id: "41",
    comment_no: "1",

    created_at: "2026-03-31T17:02:41Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 5,

    type: "COMMENT",
    action: "COMMENT_CREATED",

    actor_id: "41",
    comment_no: "2",

    created_at: "2026-03-31T17:06:18Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 6,

    type: "ASSIGNMENT",
    action: "ASSIGNEE_CHANGED",

    actor_id: "41",
    comment_no: null,

    from_value: "41",
    to_value: "41,31",

    created_at: "2026-04-01T00:48:22Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 7,

    type: "COMMENT",
    action: "COMMENT_CREATED",

    actor_id: "31",
    comment_no: "3",

    created_at: "2026-04-01T01:26:17Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 8,

    type: "TRACK_TIME",
    action: "TRACK_TIME_UPDATED",

    actor_id: "31",
    comment_no: null,

    created_at: "2026-04-01T02:10:44Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 9,

    type: "STATUS",
    action: "STATUS_CHANGED",

    actor_id: "31",
    comment_no: null,

    from_value: "Working",
    to_value: "Rejected",

    metadata: {
      reason:
        "Unit ID modification is restricted to maintain data integrity and auditability",
      note: "Please escalate correction requests through team leader for validation",
    },

    created_at: "2026-04-01T03:18:06Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 10,

    type: "COMMENT",
    action: "COMMENT_CREATED",

    actor_id: "31",
    comment_no: "4",

    created_at: "2026-04-01T03:22:49Z",
  },
];
