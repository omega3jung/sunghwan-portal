import { TICKET_ACTION_MOCK_DEFAULTS, TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Bonjour Amelia et Matthew.<br>Puis-je mettre à jour leurs journaux de travail afin qu’ils voient l’heure correcte ?",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-06-25T13:15:53Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,

    tka_action_type: "COMMENT",
    tka_content:
      "Attendez, Evan. Nous vérifions le type de travail. Il pourrait s’agir d’un travail supplémentaire, et non d’heures supplémentaires.",
    tka_owner_username: "amelia_brown",

    tka_created_at: "2026-06-26T00:01:58Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "COMMENT",
    tka_content:
      "Bien reçu, Amelia. Je vais maintenant passer ce ticket au statut 'Pending'.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-06-26T01:17:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
];
