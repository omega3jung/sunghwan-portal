import { TICKET_ACTION_MOCK_DEFAULTS, TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Bonjour, Grant.<br>Nous vérifions actuellement le flux de transaction.<br>Veuillez confirmer si cela affecte un seul utilisateur ou toute l’équipe logistique.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-06-02T06:15:48Z",
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
      "Cela affecte toute l’équipe d’expédition sortante.<br>Plusieurs utilisateurs ont essayé et tous restent bloqués avec l’indicateur de chargement.",
    tka_owner_username: "grant_murphy",

    tka_created_at: "2026-06-02T06:19:36Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "NOTE",
    tka_content:
      "La cause racine a été identifiée.<br>Un verrou de base de données sur le flux de transaction d’expédition empêche les requêtes de se terminer.<br>Je libère la session bloquée et je vérifie que les transactions en attente reprennent normalement.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-02T06:52:08Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,

    tka_action_no: 4,

    tka_action_type: "COMMENT",
    tka_content:
      "Mise à jour : le verrou de base de données a été résolu et l’expédition sortante est de nouveau traitée normalement.<br>Veuillez actualiser la page et réessayer la transaction.<br>Aucune correction de données supplémentaire n’est requise de notre côté.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-02T07:21:42Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
];
