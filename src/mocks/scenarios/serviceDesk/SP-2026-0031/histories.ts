import { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory/api";

import { ticket } from "./ticket";

export const histories: DbTicketHistory[] = [
  {
    ticket_id: ticket.id,
    history_no: 1,

    type: "TICKET",
    action: "CREATED",

    actor_id: "liam_williams",
    action_no: null,

    created_at: "2026-03-26T22:44:33Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 2,

    type: "APPROVAL",
    action: "APPROVAL_REQUESTED",

    actor_id: null,
    action_no: null,

    created_at: "2026-03-26T22:44:34Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 3,

    type: "APPROVAL",
    action: "APPROVAL_APPROVED",

    actor_id: "olivia_johnson",
    action_no: null,

    created_at: "2026-03-27T08:48:37Z",
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

    created_at: "2026-03-27T08:48:38Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 5,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "evan_seo",
    action_no: "1",

    created_at: "2026-03-27T09:15:00Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 6,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "liam_williams",
    action_no: "2",

    created_at: "2026-03-27T12:55:58Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 7,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "evan_seo",
    action_no: "3",

    created_at: "2026-03-27T14:36:47Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 8,

    type: "STATUS",
    action: "UPDATED",

    actor_id: "evan_seo",
    action_no: null,

    from_value: "Working",
    to_value: "Resolved",

    created_at: "2026-03-27T14:37:05Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 9,

    type: "WORK_SESSION",
    action: "UPDATED",

    actor_id: "evan_seo",
    action_no: null,

    created_at: "2026-03-27T14:38:25Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 10,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "liam_williams",
    action_no: "4",

    created_at: "2026-03-27T15:02:13Z",
  },
];
