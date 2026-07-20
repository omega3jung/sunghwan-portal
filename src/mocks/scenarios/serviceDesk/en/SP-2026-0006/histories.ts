import { TicketHistoryMockInput } from "../../types";
import { ticket } from "./ticket";

export const histories: TicketHistoryMockInput[] = [
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 1,

    tkh_history_type: "TICKET",
    tkh_event: "TICKET_SUBMITTED",

    tkh_actor_username: "liam_williams",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-06T06:13:27Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 2,

    tkh_history_type: "ASSIGNMENT",
    tkh_event: "ASSIGNMENT_RESOLVED",

    tkh_actor_username: null,
    tkh_action_no: null,
    tkh_source: "ASSIGNMENT_RULE",

    tkh_from_value: { assigneeUsernames: [] },
    tkh_to_value: { assigneeUsernames: ["evan_seo", "daniel_kim"] },
    tkh_metadata: {},

    tkh_created_at: "2026-07-06T06:18:09Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 3,

    tkh_history_type: "STATUS",
    tkh_event: "STATUS_UPDATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",

    tkh_from_value: { status: "Assigned" },
    tkh_to_value: { status: "Working" },
    tkh_metadata: {},

    tkh_created_at: "2026-07-06T06:20:03Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 4,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: 1,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-06T06:22:11Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 5,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "liam_williams",
    tkh_action_no: 2,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-06T06:25:44Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 6,

    tkh_history_type: "TICKET",
    tkh_event: "TICKET_MERGED",

    tkh_actor_username: "daniel_kim",
    tkh_action_no: 3,
    tkh_source: "USER_ACTION",

    tkh_from_value: { status: "Working", mergedIntoTicketId: null },
    tkh_to_value: {
      status: "Closed",
      closeReason: "Merged",
      mergedIntoTicketId: ticket.tk_merged_into_ticket_id,
      mergedIntoTicketNo: ticket.tk_merged_into_ticket_no,
    },

    tkh_metadata: {
      closeReason: "Merged",
      mergedIntoTicketId: ticket.tk_merged_into_ticket_id,
      mergedIntoTicketNo: ticket.tk_merged_into_ticket_no,
      reason:
        "Duplicate of the same portal performance incident already tracked in SP-2026-0005",
      note: "Closed as merged child ticket",
    },

    tkh_created_at: "2026-07-06T07:12:34Z",
  },
];
