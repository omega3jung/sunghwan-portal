import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "APPROVE",
    tka_content: "Quentin Wilson a approuvé la demande.",
    tka_owner_username: "quentin_wilson",
    tka_created_at: "2026-07-10T17:29:25Z",
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
      "Bonjour Sam.<br>Pourriez-vous expliquer pourquoi Tessa doit accéder aux tickets du portail ?",
    tka_owner_username: "adrian_usman",
    tka_created_at: "2026-07-10T18:15:53Z",
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
      "Elle doit pouvoir soumettre et documenter les demandes d’amélioration et de nouvelles fonctionnalités du portail. Nous prendrons les décisions, tandis qu’elle créera et suivra les demandes.",
    tka_owner_username: "samuel_anderson",
    tka_created_at: "2026-07-10T19:01:58Z",
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
      "Compris, Sam. L’autorisation a été accordée. Faites-nous savoir si vous rencontrez un problème.",
    tka_owner_username: "adrian_usman",
    tka_created_at: "2026-07-10T20:17:18Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
