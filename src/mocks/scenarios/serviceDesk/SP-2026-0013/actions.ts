import { TICKET_ACTION_MOCK_DEFAULTS, TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Olivia Johnson aprobó",
    tka_owner_username: "olivia_johnson",

    tka_created_at: "2026-05-27T01:20:05Z",
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
      "Hola, Liam.<br>Ten en cuenta que esta solicitud puede tardar hasta 3 días según el SLA.<br>Tenemos que revisar la configuración de la impresora y validar la salida de la etiqueta.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T01:23:18Z",
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
    tka_content: "Entendido. Avísame cuando hayas terminado.",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T01:40:42Z",
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
      "Hola, Mason Kwon. ¿Podrías configurar una impresora para el equipo de reparaciones y comprobar que imprima correctamente?<br>Ya terminé de configurar este código de barras en el sistema y verifiqué que se imprime a través del archivo PDF.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-30T01:12:20Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,

    tka_action_type: "NOTE",
    tka_content:
      "Hola.<br><br>El código de barras en sí es correcto, pero el ancho de la etiqueta es demasiado pequeño,<br>lo que provoca que el lado derecho se corte durante la impresión.<br><br>He pedido etiquetas más anchas y actualizaré cuando las reciba.",
    tka_owner_username: "mason_kwon",

    tka_created_at: "2026-05-30T01:48:10Z",
    tka_updated_at: null,
    tka_active: true,

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
