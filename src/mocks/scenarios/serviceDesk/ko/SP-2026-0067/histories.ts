import { TicketHistoryMockInput } from "../../types";
import { ticket } from "./ticket";

const securityAssignees = [
  "isabella_oh",
  "julian_moon",
  "benjamin_hong",
  "aria_jeon",
];

export const histories: TicketHistoryMockInput[] = [
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 1,

    tkh_history_type: "TICKET",
    tkh_event: "TICKET_SUBMITTED",

    tkh_actor_username: "james_smith",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-07T01:13:27Z",
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
    tkh_to_value: { assigneeUsernames: securityAssignees },
    tkh_metadata: {},

    tkh_created_at: "2026-07-07T01:13:28Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 3,

    tkh_history_type: "STATUS",
    tkh_event: "STATUS_UPDATED",

    tkh_actor_username: "julian_moon",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",
    tkh_from_value: { status: "Assigned" },
    tkh_to_value: { status: "Working" },
    tkh_metadata: {},

    tkh_created_at: "2026-07-07T01:16:00Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 4,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "julian_moon",
    tkh_action_no: 1,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-07T01:20:14Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 5,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "julian_moon",
    tkh_action_no: 2,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {
      accountUsername: "aria_young",
      securityStatus: "ACCOUNT_LOCKED",
    },

    tkh_created_at: "2026-07-07T02:02:38Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 6,

    tkh_history_type: "ASSIGNMENT",
    tkh_event: "ASSIGNMENT_UPDATED",

    tkh_actor_username: "julian_moon",
    tkh_action_no: 3,
    tkh_source: "USER_ACTION",
    tkh_from_value: { assigneeUsernames: securityAssignees },
    tkh_to_value: {
      assigneeUsernames: ticket.tk_assignee_usernames,
    },
    tkh_metadata: {
      reason: "HR offboarding verification requested",
    },

    tkh_created_at: "2026-07-07T02:04:12Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 7,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "matthew_williams",
    tkh_action_no: 4,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {
      hrVerificationStatus: "CONFIRMED",
    },

    tkh_created_at: "2026-07-07T02:34:45Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 8,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "julian_moon",
    tkh_action_no: 5,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {
      resolution: "OFFBOARDING_ACCOUNT_LOCK_COMPLETED",
    },

    tkh_created_at: "2026-07-07T02:40:06Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 9,

    tkh_history_type: "STATUS",
    tkh_event: "STATUS_UPDATED",

    tkh_actor_username: "julian_moon",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",
    tkh_from_value: { status: "Working" },
    tkh_to_value: { status: "Resolved" },
    tkh_metadata: {
      resolution: "OFFBOARDING_ACCOUNT_LOCK_COMPLETED",
    },

    tkh_created_at: "2026-07-07T02:41:12Z",
  },
];
