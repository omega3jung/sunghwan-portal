import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Bonjour Liam.<br>Veuillez noter que cette demande peut prendre jusqu’à 3 jours selon le SLA.<br>Nous devons vérifier la configuration de l’imprimante et valider la sortie de l’étiquette.",
    owner_id: "evan_seo",

    created_at: "2026-05-27T01:23:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 2,

    action_type: "COMMENT",
    content: "Compris. Préviens-moi lorsque tu auras terminé.",
    owner_id: "liam_williams",

    created_at: "2026-05-27T01:40:42Z",
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
      "Bonjour Mason Kwon. Pourriez-vous configurer une imprimante pour l’équipe de réparation et vérifier qu’elle imprime correctement ?<br>J’ai terminé la configuration de ce code-barres dans le système et vérifié son impression via le fichier PDF.",
    owner_id: "evan_seo",

    created_at: "2026-05-30T01:12:20Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 4,

    action_type: "NOTE",
    content:
      "Bonjour.<br><br>Le code-barres lui-même est correct, mais la largeur de l’étiquette est trop petite,<br>ce qui entraîne la coupure du côté droit lors de l’impression.<br><br>J’ai commandé des étiquettes plus larges et je vous tiendrai informé dès réception.",
    owner_id: "mason_kwon",

    created_at: "2026-05-30T01:48:10Z",
    updated_at: null,
    active: true,

    files: [],
    images: [
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
