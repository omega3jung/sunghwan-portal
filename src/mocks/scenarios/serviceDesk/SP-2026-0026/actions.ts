import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Bonjour Liam.<br>Nous vérifions actuellement ce problème avec l’équipe backend.<br>Merci de confirmer quelles étapes du processus sont bloquées pour l’équipe de réparation.",
    owner_id: "41",

    created_at: "2026-04-02T06:22:11Z",
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
      "Les écrans de réception, de réparation et de contrôle qualité sont tous bloqués.<br>Tous les écrans concernés continuent d’afficher uniquement l’icône de chargement et les utilisateurs ne peuvent pas continuer.",
    owner_id: "53",

    created_at: "2026-04-02T06:25:44Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "MERGE",
    content:
      "Ce ticket a été fusionné avec SP-2026-0025, car il s’agit du même incident causé par le même verrou de base de données.<br>Le suivi et les échanges se poursuivront dans le ticket représentatif.",
    owner_id: "31",

    created_at: "2026-04-02T07:13:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
