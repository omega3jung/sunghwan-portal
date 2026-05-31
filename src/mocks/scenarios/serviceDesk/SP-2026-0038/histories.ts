import { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory/api";

import { ticket } from "./ticket";

export const histories: DbTicketHistory[] = [
  {
    ticket_id: ticket.id,
    history_no: 1,

    type: "TICKET",
    action: "CREATED",

    actor_id: "vivian_long",
    action_no: null,

    created_at: "2026-04-25T07:13:53Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 2,

    type: "APPROVAL",
    action: "APPROVAL_REQUESTED",

    actor_id: null,
    action_no: null,

    created_at: "2026-04-25T07:13:53Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 3,

    type: "APPROVAL",
    action: "APPROVAL_APPROVED",

    actor_id: "olivia_johnson",
    action_no: null,

    created_at: "2026-04-25T07:29:25Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 4,

    type: "ASSIGNMENT",
    action: "UPDATED",

    actor_id: null,
    action_no: null,

    from_value: null,
    to_value: "3",

    created_at: "2026-04-25T07:29:30Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 5,

    type: "ASSIGNMENT",
    action: "UPDATED",

    actor_id: null,
    action_no: null,

    from_value: null,
    to_value: "4",

    created_at: "2026-04-25T07:29:30Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 6,

    type: "ASSIGNMENT",
    action: "UPDATED",

    actor_id: null,
    action_no: null,

    from_value: null,
    to_value: "41",

    created_at: "2026-04-25T07:29:30Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 7,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "evan_seo",
    action_no: "1",

    created_at: "2026-04-25T13:15:53Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 8,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "liam_williams",
    action_no: "2",

    created_at: "2026-04-26T00:01:58Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 9,

    type: "COMMENT",
    action: "CREATED",

    actor_id: "amelia_brown",
    action_no: "3",

    created_at: "2026-04-26T01:17:18Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 10,

    type: "STATUS",
    action: "UPDATED",

    actor_id: "evan_seo",
    action_no: null,

    from_value: "Working",
    to_value: "Pending",

    created_at: "2026-03-27T14:37:05Z",
  },
];
