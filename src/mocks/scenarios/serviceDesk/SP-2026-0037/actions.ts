import { TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Demo Leader님이 승인했습니다",
    tka_owner_username: "__demo_leader__",

    tka_created_at: "2026-06-24T01:18:09Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
