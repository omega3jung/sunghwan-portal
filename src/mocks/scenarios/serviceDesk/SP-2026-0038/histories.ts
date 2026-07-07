import { TICKET_HISTORY_MOCK_DEFAULTS, TicketHistoryMockInput } from "../types";
import { ticket } from "./ticket";

export const histories: TicketHistoryMockInput[] = [
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 1,

    tkh_history_type: "TICKET",
    tkh_history_action: "CREATED",

    tkh_actor_username: "vivian_long",
    tkh_action_no: null,

    tkh_created_at: "2026-06-25T07:13:53Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 2,

    tkh_history_type: "APPROVAL",
    tkh_history_action: "APPROVAL_REQUESTED",

    tkh_actor_username: null,
    tkh_action_no: null,

    tkh_created_at: "2026-06-25T07:13:53Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 3,

    tkh_history_type: "APPROVAL",
    tkh_history_action: "APPROVAL_APPROVED",

    tkh_actor_username: "olivia_johnson",
    tkh_action_no: "1",

    tkh_created_at: "2026-06-25T07:29:25Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 4,

    tkh_history_type: "ASSIGNMENT",
    tkh_history_action: "UPDATED",

    tkh_actor_username: null,
    tkh_action_no: null,

    tkh_from_value: null,
    tkh_to_value: "3",

    tkh_created_at: "2026-06-25T07:29:30Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 5,

    tkh_history_type: "ASSIGNMENT",
    tkh_history_action: "UPDATED",

    tkh_actor_username: null,
    tkh_action_no: null,

    tkh_from_value: null,
    tkh_to_value: "4",

    tkh_created_at: "2026-06-25T07:29:30Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 6,

    tkh_history_type: "ASSIGNMENT",
    tkh_history_action: "UPDATED",

    tkh_actor_username: null,
    tkh_action_no: null,

    tkh_from_value: null,
    tkh_to_value: "41",

    tkh_created_at: "2026-06-25T07:29:30Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 7,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: "2",

    tkh_created_at: "2026-06-25T13:15:53Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 8,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "liam_williams",
    tkh_action_no: "3",

    tkh_created_at: "2026-06-26T00:01:58Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 9,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "amelia_brown",
    tkh_action_no: "4",

    tkh_created_at: "2026-06-26T01:17:18Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 10,

    tkh_history_type: "STATUS",
    tkh_history_action: "UPDATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: null,

    tkh_from_value: "Working",
    tkh_to_value: "Pending",

    tkh_created_at: "2026-05-27T14:37:05Z",
  },
];
