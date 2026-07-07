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

    tkh_created_at: "2026-06-02T06:13:27Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 2,

    tkh_history_type: "ASSIGNMENT",
    tkh_history_action: "UPDATED",

    tkh_actor_username: null,
    tkh_action_no: null,

    tkh_from_value: { assigneeUsernames: [] },
    tkh_to_value: { assigneeUsernames: ["evan_seo", "daniel_kim"] },

    tkh_created_at: "2026-06-02T06:18:09Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 3,

    tkh_history_type: "STATUS",
    tkh_history_action: "UPDATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: null,

    tkh_from_value: { status: "Assigned" },
    tkh_to_value: { status: "Working" },

    tkh_created_at: "2026-06-02T06:20:03Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 4,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: 1,

    tkh_created_at: "2026-06-02T06:22:11Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 5,

    tkh_history_type: "COMMENT",
    tkh_history_action: "CREATED",

    tkh_actor_username: "liam_williams",
    tkh_action_no: 2,

    tkh_created_at: "2026-06-02T06:25:44Z",
  },
  {
    ...TICKET_HISTORY_MOCK_DEFAULTS,
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 6,

    tkh_history_type: "TICKET",
    tkh_history_action: "TICKET_MERGED",

    tkh_actor_username: "daniel_kim",
    tkh_action_no: 3,

    tkh_from_value: { status: "Working" },
    tkh_to_value: {
      status: "Closed",
      closeReason: "Merged",
    },

    tkh_metadata: {
      mergedIntoTicketId: ticket.tk_merged_into_ticket_id,
      mergedIntoTicketNo: ticket.tk_merged_into_ticket_no,
      reason:
        "Duplicado del mismo incidente de rendimiento del portal ya registrado en SP-2026-0015",
      note: "Closed as merged child ticket",
    },

    tkh_created_at: "2026-06-02T07:12:34Z",
  },
];
