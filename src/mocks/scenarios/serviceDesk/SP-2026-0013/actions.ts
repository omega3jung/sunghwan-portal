import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hola, Liam.<br>Ten en cuenta que esta solicitud puede tardar hasta 3 días según el SLA.<br>Tenemos que revisar la configuración de la impresora y validar la salida de la etiqueta.",
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
    content: "Entendido. Avísame cuando hayas terminado.",
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
      "Hola, Mason Kwon. ¿Podrías configurar una impresora para el equipo de reparaciones y comprobar que imprima correctamente?<br>Ya terminé de configurar este código de barras en el sistema y verifiqué que se imprime a través del archivo PDF.",
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
      "Hola.<br><br>El código de barras en sí es correcto, pero el ancho de la etiqueta es demasiado pequeño,<br>lo que provoca que el lado derecho se corte durante la impresión.<br><br>He pedido etiquetas más anchas y actualizaré cuando las reciba.",
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
