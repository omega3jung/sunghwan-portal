import { TICKET_ACTION_MOCK_DEFAULTS, TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Olivia Johnson a approuvé",
    tka_owner_username: "olivia_johnson",

    tka_created_at: "2026-05-27T08:48:37Z",
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
      "Bonjour, Liam.<br>Je n'ai pas trouvé 84321565 dans le système. Peux-tu vérifier que l'identifiant de l'appareil est correct ?<br> Merci.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T09:15:00Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "COMMENT",
    tka_content:
      "84321565 est correct. Merci de vérifier la capture d'écran.<br><img src='/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png' />",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T12:55:58Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [
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
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,

    tka_action_type: "COMMENT",
    tka_content:
      "C'était ' 84321565'. Il y a un espace avant 84321565.<br> J'ai mis à jour l'identifiant de l'appareil à 84321585.<br> Merci, cordialement.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T14:36:47Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,

    tka_action_type: "COMMENT",
    tka_content: "Merci !!",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T15:02:13Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
];
