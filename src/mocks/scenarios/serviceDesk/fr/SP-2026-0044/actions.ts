import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Bonjour Olivia.<br>Merci d'avoir soumis cette demande directement. Comme elle a été créée par une responsable de l'équipe de réparation, aucune étape d'approbation supplémentaire n'est nécessaire.<br>Nous examinons l'impact de cet accès avec l'équipe IT, car Unit ID est utilisé comme identifiant principal dans les enregistrements en aval.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-04T17:02:41Z",
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
      "Bonjour Daniel.<br>Pourrais-tu aider sur ce ticket ?<br>Ils souhaitent accorder le droit de modification au groupe d'employés Repair Technician.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-04T17:06:18Z",
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
      "Revu du point de vue de la gouvernance IT.<br>Unit ID est un identifiant critique et doit rester limité à des rôles contrôlés.<br>Étendre le droit de modification aux utilisateurs généraux de réparation augmenterait le risque d'incohérence des données et rendrait le suivi d'audit difficile lorsque des corrections sont effectuées ultérieurement.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-07-05T01:26:17Z",
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
      "Bonjour Olivia.<br>Après examen, je rejette cette demande.<br><br>Raison :<br>La modification de Unit ID est restreinte afin de préserver l'intégrité des données et l'auditabilité.<br><br>Recommandation :<br>Veuillez faire remonter les demandes de correction au leader d'équipe pour validation.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-07-05T03:22:49Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
