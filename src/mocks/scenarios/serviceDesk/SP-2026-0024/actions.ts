import { DbTicketAction } from "@/feature/serviceDesk/ticketAction";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Bonjour Olivia.<br>Merci d'avoir soumis cette demande directement. Comme elle a été créée par une responsable de l'équipe de réparation, aucune étape d'approbation supplémentaire n'est nécessaire.<br>Nous examinons l'impact de cet accès avec l'équipe IT, car Unit ID est utilisé comme identifiant principal dans les enregistrements en aval.",
    owner_id: "41",

    created_at: "2026-03-31T17:02:41Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 2,

    action_type: "ASSIGN",
    content:
      "Bonjour Daniel.<br>Pourrais-tu aider sur ce ticket ?<br>Ils souhaitent accorder le droit de modification au groupe d'employés Repair Technician.",
    owner_id: "41",

    created_at: "2026-03-31T17:06:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content:
      "Revu du point de vue de la gouvernance IT.<br>Unit ID est un identifiant critique et doit rester limité à des rôles contrôlés.<br>Étendre le droit de modification aux utilisateurs généraux de réparation augmenterait le risque d'incohérence des données et rendrait le suivi d'audit difficile lorsque des corrections sont effectuées ultérieurement.",
    owner_id: "31",

    created_at: "2026-04-01T01:26:17Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 4,

    action_type: "COMMENT",
    content:
      "Bonjour Olivia.<br>Après examen, je rejette cette demande.<br><br>Raison :<br>La modification de Unit ID est restreinte afin de préserver l'intégrité des données et l'auditabilité.<br><br>Recommandation :<br>Veuillez faire remonter les demandes de correction au leader d'équipe pour validation.",
    owner_id: "31",

    created_at: "2026-04-01T03:22:49Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
