import { TICKET_HISTORY_MOCK_DEFAULTS, TicketHistoryMockInput } from "../types";
import { ticket } from "./ticket";

export const histories: TicketHistoryMockInput[] = [
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 1,

    tkh_history_type: "TICKET",
    tkh_history_action: "CREATED",

    tkh_actor_username: "liam_williams",
    tkh_action_no: null,

    tkh_created_at: "2026-05-27T02:44:33Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 2,

    tkh_history_type: "APPROVAL",
    tkh_history_action: "APPROVAL_REQUESTED",

    tkh_actor_username: null,
    tkh_action_no: null,

    tkh_created_at: "2026-05-27T02:44:34Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 3,

    tkh_history_type: "APPROVAL",
    tkh_history_action: "APPROVAL_APPROVED",

    tkh_actor_username: "olivia_johnson",
    tkh_action_no: 1,

    tkh_created_at: "2026-05-27T08:07:18Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 4,

    tkh_history_type: "ASSIGNMENT",
    tkh_history_action: "UPDATED",

    tkh_actor_username: null,
    tkh_action_no: null,

    tkh_from_value: { assigneeUsernames: [] },
    tkh_to_value: { assigneeUsernames: ["evan_seo"] },

    tkh_created_at: "2026-05-27T08:07:19Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 5,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: 2,

    tkh_created_at: "2026-05-27T08:20:00Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 6,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "liam_williams",
    tkh_action_no: 3,

    tkh_created_at: "2026-05-27T08:41:12Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 7,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: 4,

    tkh_created_at: "2026-05-27T09:15:11Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 8,

    tkh_history_type: "STATUS",
    tkh_history_action: "UPDATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: null,

    tkh_from_value: { status: "Working" },
    tkh_to_value: { status: "Resolved" },

    tkh_created_at: "2026-05-27T09:15:28Z",
  },
];
