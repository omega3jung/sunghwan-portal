import { TICKET_HISTORY_MOCK_DEFAULTS, TicketHistoryMockInput } from "../types";
import { ticket } from "./ticket";

export const histories: TicketHistoryMockInput[] = [
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 1,

    tkh_history_type: "TICKET",
    tkh_history_action: "CREATED",

    tkh_actor_username: "grant_murphy",
    tkh_action_no: null,

    tkh_created_at: "2026-06-02T06:03:14Z",
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
    tkh_to_value: "41,31",

    tkh_created_at: "2026-06-02T06:06:20Z",
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

    tkh_created_at: "2026-06-02T06:10:27Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 4,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: "1",

    tkh_created_at: "2026-06-02T06:15:48Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 5,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "grant_murphy",
    tkh_action_no: "2",

    tkh_created_at: "2026-06-02T06:19:36Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 6,

    tkh_history_type: "NOTE",
    tkh_history_action: "CREATED",

    tkh_actor_username: "daniel_kim",
    tkh_action_no: "3",

    tkh_created_at: "2026-06-02T06:52:08Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 7,

    tkh_history_type: "STATUS",
    tkh_history_action: "UPDATED",

    tkh_actor_username: "daniel_kim",
    tkh_action_no: null,

    tkh_from_value: "Working",
    tkh_to_value: "Resolved",

    tkh_metadata: {
      reason: "DB lock released and blocked transactions recovered",
    },

    tkh_created_at: "2026-06-02T07:20:31Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 8,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "daniel_kim",
    tkh_action_no: "4",

    tkh_created_at: "2026-06-02T07:21:42Z",
  },
];
