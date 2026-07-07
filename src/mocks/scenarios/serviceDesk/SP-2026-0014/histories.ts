import { TICKET_HISTORY_MOCK_DEFAULTS, TicketHistoryMockInput } from "../types";
import { ticket } from "./ticket";

export const histories: TicketHistoryMockInput[] = [
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 1,

    tkh_history_type: "TICKET",
    tkh_history_action: "CREATED",

    tkh_actor_username: "olivia_johnson",
    tkh_action_no: null,

    tkh_created_at: "2026-05-31T16:25:38Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 2,

    tkh_history_type: "ASSIGNMENT",
    tkh_history_action: "UPDATED",

    tkh_actor_username: null,
    tkh_action_no: null,

    tkh_from_value: null,
    tkh_to_value: "41",

    tkh_created_at: "2026-05-31T16:31:12Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 3,

    tkh_history_type: "STATUS",
    tkh_history_action: "UPDATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: null,

    tkh_from_value: "Assigned",
    tkh_to_value: "Working",

    tkh_created_at: "2026-05-31T16:44:05Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 4,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: "1",

    tkh_created_at: "2026-05-31T17:02:41Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 5,

    tkh_history_type: "ASSIGNMENT",
    tkh_history_action: "UPDATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: "2",

    tkh_created_at: "2026-05-31T17:06:18Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 6,

    tkh_history_type: "ASSIGNMENT",
    tkh_history_action: "UPDATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: null,

    tkh_from_value: "41",
    tkh_to_value: "41,31",

    tkh_created_at: "2026-06-01T00:48:22Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 7,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "daniel_kim",
    tkh_action_no: "3",

    tkh_created_at: "2026-06-01T01:26:17Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 8,

    tkh_history_type: "TICKET",
    tkh_history_action: "TICKET_REJECTED",

    tkh_actor_username: "daniel_kim",
    tkh_action_no: null,

    tkh_from_value: "Working",
    tkh_to_value: "Rejected",

    tkh_metadata: {
      reason:
        "Unit ID modification is restricted to maintain data integrity and auditability",
      note: "Please escalate correction requests through team leader for validation",
    },

    tkh_created_at: "2026-06-01T03:18:06Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 9,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "daniel_kim",
    tkh_action_no: "4",

    tkh_created_at: "2026-06-01T03:22:49Z",
  },
];
