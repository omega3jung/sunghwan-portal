import { TICKET_ACTION_MOCK_DEFAULTS, TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Hola, Liam.<br>No pude encontrar 84321565 en el sistema. ¿Podrías verificar si el ID del dispositivo es correcto?<br> Gracias.",
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
    tka_action_no: 2,

    tka_action_type: "COMMENT",
    tka_content:
      "84321565 es correcto. Revisa la captura de pantalla.<br><img src='/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png' />",
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
    tka_action_no: 3,

    tka_action_type: "COMMENT",
    tka_content:
      "Era ' 84321565'. Hay un espacio en blanco antes de 84321565.<br> Actualicé el ID del dispositivo a 84321585.<br> Saludos y gracias.",
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
    tka_action_no: 4,

    tka_action_type: "COMMENT",
    tka_content: "¡¡Gracias!!",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T15:02:13Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
];
