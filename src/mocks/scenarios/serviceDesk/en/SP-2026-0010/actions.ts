import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "APPROVE",
    tka_content: "Quentin Wilson approved the request.",
    tka_owner_username: "quentin_wilson",
    tka_created_at: "2026-07-10T17:29:25Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,
    tka_action_type: "COMMENT",
    tka_content:
      "Hello, Sam.<br>Could you explain why Tessa needs access to portal tickets?",
    tka_owner_username: "adrian_usman",
    tka_created_at: "2026-07-10T18:15:53Z",
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
      "She needs access to submit and document portal improvement and new feature requests. We will make the decisions, while she creates and tracks the requests.",
    tka_owner_username: "samuel_anderson",
    tka_created_at: "2026-07-10T19:01:58Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,
    tka_action_type: "COMMENT",
    tka_content:
      "Understood, Sam. The permission has been granted. Please let us know if there are any issues.",
    tka_owner_username: "adrian_usman",
    tka_created_at: "2026-07-10T20:17:18Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
