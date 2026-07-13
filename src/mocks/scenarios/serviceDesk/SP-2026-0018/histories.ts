import { TicketHistoryMockInput } from "../types";
import { ticket } from "./ticket";

export const histories: TicketHistoryMockInput[] = [
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 1,

    tkh_history_type: "TICKET",
    tkh_event: "TICKET_SUBMITTED",

    tkh_actor_username: "vivian_long",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {
    },

    tkh_created_at: "2026-06-25T07:13:53Z",
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
    tkh_to_value: null,
    tkh_metadata: {
    },

    tkh_created_at: "2026-06-25T07:13:53Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 3,

    tkh_history_type: "APPROVAL",
    tkh_event: "APPROVAL_APPROVED",

    tkh_actor_username: "olivia_johnson",
    tkh_action_no: 1,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {
    },

    tkh_created_at: "2026-06-25T07:29:25Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 4,

    tkh_history_type: "ASSIGNMENT",
    tkh_event: "ASSIGNMENT_RESOLVED",

    tkh_actor_username: null,
    tkh_action_no: null,
    tkh_source: "ASSIGNMENT_RULE",

    tkh_from_value: { assigneeUsernames: [] },
    tkh_to_value: { assigneeUsernames: ["matthew_williams"] },
    tkh_metadata: {
    },

    tkh_created_at: "2026-06-25T07:29:30Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 5,

    tkh_history_type: "ASSIGNMENT",
    tkh_event: "ASSIGNMENT_RESOLVED",

    tkh_actor_username: null,
    tkh_action_no: null,
    tkh_source: "ASSIGNMENT_RULE",

    tkh_from_value: { assigneeUsernames: [] },
    tkh_to_value: { assigneeUsernames: ["amelia_brown"] },
    tkh_metadata: {
    },

    tkh_created_at: "2026-06-25T07:29:30Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 6,

    tkh_history_type: "ASSIGNMENT",
    tkh_event: "ASSIGNMENT_RESOLVED",

    tkh_actor_username: null,
    tkh_action_no: null,
    tkh_source: "ASSIGNMENT_RULE",

    tkh_from_value: { assigneeUsernames: [] },
    tkh_to_value: { assigneeUsernames: ["evan_seo"] },
    tkh_metadata: {
    },

    tkh_created_at: "2026-06-25T07:29:30Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 7,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: 2,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {
    },

    tkh_created_at: "2026-06-25T13:15:53Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 8,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "liam_williams",
    tkh_action_no: 3,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {
    },

    tkh_created_at: "2026-06-26T00:01:58Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 9,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "amelia_brown",
    tkh_action_no: 4,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {
    },

    tkh_created_at: "2026-06-26T01:17:18Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 10,

    tkh_history_type: "STATUS",
    tkh_event: "STATUS_UPDATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",

    tkh_from_value: { status: "Working" },
    tkh_to_value: { status: "Pending" },
    tkh_metadata: {
    },

    tkh_created_at: "2026-05-27T14:37:05Z",
  },
];
