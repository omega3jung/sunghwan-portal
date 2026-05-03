import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Bonjour, Grant.<br>Nous vérifions actuellement le flux de transaction.<br>Veuillez confirmer si cela affecte un seul utilisateur ou toute l’équipe logistique.",
    owner_id: "41",

    created_at: "2026-04-02T06:15:48Z",
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
      "Cela affecte toute l’équipe d’expédition sortante.<br>Plusieurs utilisateurs ont essayé et tous restent bloqués avec l’indicateur de chargement.",
    owner_id: "141",

    created_at: "2026-04-02T06:19:36Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "NOTE",
    content:
      "La cause racine a été identifiée.<br>Un verrou de base de données sur le flux de transaction d’expédition empêche les requêtes de se terminer.<br>Je libère la session bloquée et je vérifie que les transactions en attente reprennent normalement.",
    owner_id: "31",

    created_at: "2026-04-02T06:52:08Z",
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
      "Mise à jour : le verrou de base de données a été résolu et l’expédition sortante est de nouveau traitée normalement.<br>Veuillez actualiser la page et réessayer la transaction.<br>Aucune correction de données supplémentaire n’est requise de notre côté.",
    owner_id: "31",

    created_at: "2026-04-02T07:21:42Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
