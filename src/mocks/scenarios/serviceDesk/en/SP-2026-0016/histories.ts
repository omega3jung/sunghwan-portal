import { TicketHistoryMockInput } from "../../types";
import { ticket } from "./ticket";

export const histories: TicketHistoryMockInput[] = [
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 1,

    tkh_history_type: "TICKET",
    tkh_event: "TICKET_SUBMITTED",

    tkh_actor_username: "__demo_user__",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-16T01:13:27Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 2,

    tkh_history_type: "APPROVAL",
    tkh_event: "APPROVAL_REQUESTED",

    tkh_actor_username: null,
    tkh_action_no: null,
    tkh_source: "APPROVAL_RULE",
    tkh_from_value: null,
    tkh_to_value: { approvalStepId: "9" },
    tkh_metadata: { approvalStepId: "9" },

    tkh_created_at: "2026-07-16T01:13:28Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 3,

    tkh_history_type: "APPROVAL",
    tkh_event: "APPROVAL_DECLINED",

    tkh_actor_username: "__demo_manager__",
    tkh_action_no: 1,
    tkh_source: "USER_ACTION",
    tkh_from_value: { approvalStepId: "9", status: "Approval" },
    tkh_to_value: {
      approvalStepId: "9",
      status: "Declined",
      closeReason: "Rejected",
    },
    tkh_metadata: {
      reason: "Decline action test",
      closeReason: "Rejected",
    },

    tkh_created_at: "2026-07-16T01:18:09Z",
  },
];
