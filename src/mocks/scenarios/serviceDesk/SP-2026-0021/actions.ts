import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Bonjour, Liam.<br>Je n'ai pas trouvé 84321565 dans le système. Peux-tu vérifier que l'identifiant de l'appareil est correct ?<br> Merci.",
    owner_id: "41",

    created_at: "2026-03-27T09:15:00Z",
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
      "84321565 est correct. Merci de vérifier la capture d'écran.<br><img src='/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png' />",
    owner_id: "53",

    created_at: "2026-03-27T12:55:58Z",
    updated_at: null,
    active: true,

    files: [],
    images: [
      {
        index: 1,
        type: "image",
        name: "comment-2_image-1.png",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png",
        active: true,
      },
    ],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content:
      "C'était ' 84321565'. Il y a un espace avant 84321565.<br> J'ai mis à jour l'identifiant de l'appareil à 84321585.<br> Merci, cordialement.",
    owner_id: "41",

    created_at: "2026-03-27T14:36:47Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 4,

    action_type: "COMMENT",
    content: "Merci !!",
    owner_id: "53",

    created_at: "2026-03-27T15:02:13Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
