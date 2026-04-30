import { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory";

import { ticket } from "./ticket";

export const histories: DbTicketHistory[] = [
  {
    ticket_id: ticket.id,
    history_no: 1,

    type: "TICKET",
    action: "CREATED",

    actor_id: "__demo_user__",
    action_no: null,

    created_at: "2026-04-24T01:13:27Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 2,

    type: "APPROVAL",
    action: "APPROVAL_REQUESTED",

    actor_id: null,
    action_no: null,

    created_at: "2026-04-24T01:13:28Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 3,

    type: "APPROVAL",
    action: "APPROVAL_APPROVED",

    actor_id: "__demo_leader__",
    action_no: null,

    created_at: "2026-04-24T01:18:09Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 4,

    type: "ASSIGNMENT",
    action: "UPDATED",

    actor_id: null,
    action_no: null,

    from_value: null,
    to_value: "__demo_manager__",

    created_at: "2026-04-24T01:18:10Z",
  },
  {
    ticket_id: ticket.id,
    history_no: 5,

    type: "ASSIGNMENT",
    action: "UPDATED",

    actor_id: null,
    action_no: null,

    from_value: null,
    to_value: "__demo_admin__",

    created_at: "2026-04-24T01:18:10Z",
  },
];
