import { DbTicketAction } from "@/feature/serviceDesk/ticketAction";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Bonjour Amelia et Matthew.<br>Puis-je mettre à jour leurs journaux de travail afin qu’ils voient l’heure correcte ?",
    owner_id: "41",

    created_at: "2026-04-25T13:15:53Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 2,

    action_type: "COMMENT",
    content:
      "Attendez, Evan. Nous vérifions le type de travail. Il pourrait s’agir d’un travail supplémentaire, et non d’heures supplémentaires.",
    owner_id: "4",

    created_at: "2026-04-26T00:01:58Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content: "Bien reçu, Amelia. Je vais maintenant passer ce ticket au statut 'Pending'.",
    owner_id: "41",

    created_at: "2026-04-26T01:17:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
