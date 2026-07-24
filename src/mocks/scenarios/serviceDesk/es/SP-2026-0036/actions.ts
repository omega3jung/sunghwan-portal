import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "DECLINE",
    tka_content: "Prueba de la acción Declinar",
    tka_owner_username: "__demo_manager__",
    tka_created_at: "2026-07-16T01:18:09Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
