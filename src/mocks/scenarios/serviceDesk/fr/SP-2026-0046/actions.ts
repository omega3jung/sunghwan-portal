import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Bonjour Liam.<br>Nous vérifions actuellement ce problème avec l’équipe backend.<br>Merci de confirmer quelles étapes du processus sont bloquées pour l’équipe de réparation.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-06T06:22:11Z",
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
      "Les écrans de réception, de réparation et de contrôle qualité sont tous bloqués.<br>Tous les écrans concernés continuent d’afficher uniquement l’icône de chargement et les utilisateurs ne peuvent pas continuer.",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-07-06T06:25:44Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "MERGE",
    tka_content:
      "Ce ticket a été fusionné avec SP-2026-0045, car il s’agit du même incident causé par le même verrou de base de données.<br>Le suivi et les échanges se poursuivront dans le ticket représentatif.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-07-06T07:13:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
