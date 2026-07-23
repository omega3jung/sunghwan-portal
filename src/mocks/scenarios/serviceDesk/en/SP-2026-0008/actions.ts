import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Olivia Johnson approved",
    tka_owner_username: "olivia_johnson",

    tka_created_at: "2026-07-08T07:29:25Z",
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
      "Hello, Amelia and Matthew.<br>Can I updated there work log so they can see correct time?",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-08T13:15:53Z",
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
      "Wait, Evan. We are checking job kinds. It can be extra work, not overtime work.",
    tka_owner_username: "amelia_brown",

    tka_created_at: "2026-07-09T00:01:58Z",
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
    tka_content: "Got it Amelia. Let me set this ticket as 'Pending' now.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-09T01:17:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
