import { TicketHistoryMockInput } from "../../types";
import { ticket } from "./ticket";

export const histories: TicketHistoryMockInput[] = [
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 1,

    tkh_history_type: "TICKET",
    tkh_event: "TICKET_SUBMITTED",

    tkh_actor_username: "tessa_ito",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T08:13:53Z",
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
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T08:13:54Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 3,

    tkh_history_type: "APPROVAL",
    tkh_event: "APPROVAL_APPROVED",

    tkh_actor_username: "samuel_baker",
    tkh_action_no: 1,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T08:25:10Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 4,

    tkh_history_type: "APPROVAL",
    tkh_event: "APPROVAL_REQUESTED",

    tkh_actor_username: null,
    tkh_action_no: null,
    tkh_source: "APPROVAL_RULE",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T08:25:11Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 5,

    tkh_history_type: "APPROVAL",
    tkh_event: "APPROVAL_APPROVED",

    tkh_actor_username: "zoe_okafor",
    tkh_action_no: 2,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T08:34:42Z",
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
    tkh_to_value: {
      assigneeUsernames: [
        "olivia_park",
        "lucas_han",
        "logan_baek",
        "noah_yoon",
        "ella_nam",
        "evan_seo",
      ],
    },
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T08:34:47Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 7,

    tkh_history_type: "STATUS",
    tkh_event: "STATUS_UPDATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",

    tkh_from_value: { status: "Assigned" },
    tkh_to_value: { status: "Working" },
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T08:45:00Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 8,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: 3,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T09:02:18Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 9,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "tessa_ito",
    tkh_action_no: 4,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T09:18:36Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 10,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: 5,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T10:26:54Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 11,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "tessa_ito",
    tkh_action_no: 6,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T10:48:27Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 12,

    tkh_history_type: "COMMENT",
    tkh_event: "COMMENT_CREATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: 7,
    tkh_source: "USER_ACTION",
    tkh_from_value: null,
    tkh_to_value: null,
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T11:12:08Z",
  },
  {
    tkh_ticket_id: ticket.tk_id,
    tkh_history_no: 13,

    tkh_history_type: "STATUS",
    tkh_event: "STATUS_UPDATED",

    tkh_actor_username: "evan_seo",
    tkh_action_no: null,
    tkh_source: "USER_ACTION",

    tkh_from_value: { status: "Working" },
    tkh_to_value: { status: "Resolved" },
    tkh_metadata: {},

    tkh_created_at: "2026-07-13T11:14:20Z",
  },
];
