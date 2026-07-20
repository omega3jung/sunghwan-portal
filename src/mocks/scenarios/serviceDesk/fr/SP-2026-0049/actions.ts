import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "APPROVE",
    tka_content: "Elias Martinez a approuvé la demande.",
    tka_owner_username: "elias_martinez",
    tka_created_at: "2026-07-09T08:29:25Z",
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
      "Bonjour Fiona et Elias.<br>La facture d’expédition ne peut pas être envoyée, car cet appareil se trouve dans la zone QC. Veuillez transférer l’appareil vers le quai d’expédition, puis réessayer.",
    tka_owner_username: "evan_seo",
    tka_created_at: "2026-07-09T09:15:53Z",
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
      "Attendez, Evan. Un responsable de Demo Corporation nous a demandé de terminer ce traitement aujourd’hui. Merci de donner la priorité à cette demande.",
    tka_owner_username: "fiona_tanaka",
    tka_created_at: "2026-07-09T10:01:58Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,
    tka_action_type: "COMMENT",
    tka_content:
      "Compris, Fiona. Je vais déplacer l’appareil 357849216854353 vers le quai d’expédition et le traiter.",
    tka_owner_username: "evan_seo",
    tka_created_at: "2026-07-09T10:17:18Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,
    tka_action_type: "COMMENT",
    tka_content:
      "Nous avons confirmé que la facture d’expédition de l’appareil 357849216854353 a été envoyée. Veuillez vérifier le résultat et poursuivre les étapes suivantes.",
    tka_owner_username: "evan_seo",
    tka_created_at: "2026-07-09T12:43:05Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
