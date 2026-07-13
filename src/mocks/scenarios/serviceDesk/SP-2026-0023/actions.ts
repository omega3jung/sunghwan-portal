import { TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Olivia Johnson a approuvé",
    tka_owner_username: "olivia_johnson",

    tka_created_at: "2026-05-27T01:20:05Z",
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
      "Bonjour Liam.<br>Veuillez noter que cette demande peut prendre jusqu’à 3 jours selon le SLA.<br>Nous devons vérifier la configuration de l’imprimante et valider la sortie de l’étiquette.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T01:23:18Z",
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
    tka_content: "Compris. Préviens-moi lorsque tu auras terminé.",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T01:40:42Z",
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
      "Bonjour Mason Kwon. Pourriez-vous configurer une imprimante pour l’équipe de réparation et vérifier qu’elle imprime correctement ?<br>J’ai terminé la configuration de ce code-barres dans le système et vérifié son impression via le fichier PDF.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-30T01:12:20Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,

    tka_action_type: "NOTE",
    tka_content:
      "Bonjour.<br><br>Le code-barres lui-même est correct, mais la largeur de l’étiquette est trop petite,<br>ce qui entraîne la coupure du côté droit lors de l’impression.<br><br>J’ai commandé des étiquettes plus larges et je vous tiendrai informé dès réception.",
    tka_owner_username: "mason_kwon",

    tka_created_at: "2026-05-30T01:48:10Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [
      {
        index: 1,
        type: "image",
        name: "comment-4_image-1.png",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-3/comment-4_image-1.png",
        active: true,
      },
    ],
  },
];
