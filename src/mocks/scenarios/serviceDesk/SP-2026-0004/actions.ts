import { TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Hello, Olivia.<br>Thank you for submitting this request directly. Since it was raised by a repair team manager, no additional approval step is needed.<br>We are reviewing the access impact with the IT team because Unit ID is used as a core identifier across downstream records.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-31T17:02:41Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,

    tka_action_type: "ASSIGN",
    tka_content:
      "Hi, Daniel.<br>Could you assist this ticket?<br>They want to grant edit permission to Repair Technician, employee group.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-31T17:06:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "COMMENT",
    tka_content:
      "Reviewed from IT governance perspective.<br>Unit ID is a critical identifier and should remain restricted to controlled roles.<br>Expanding edit permission to general repair users would increase the risk of data inconsistency and make audit tracing difficult when corrections are made later.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-01T01:26:17Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,

    tka_action_type: "REJECT",
    tka_content:
      "Hello, Olivia.<br>After review, I am rejecting this request.<br><br>Reason:<br>Unit ID modification is restricted to maintain data integrity and auditability.<br><br>Recommendation:<br>Please escalate correction requests through team leader for validation.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-01T03:22:49Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
