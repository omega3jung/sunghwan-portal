import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Hola, Liam.<br>Estamos revisando este problema con el equipo de backend ahora.<br>Confirma qué pasos del proceso están bloqueados para el equipo de reparación.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-06T06:22:11Z",
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
      "Recepción, reparación y control de calidad están todos bloqueados.<br>Todas las pantallas afectadas siguen mostrando solo el icono de carga y los usuarios no pueden continuar.",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-07-06T06:25:44Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "MERGE",
    tka_content:
      "Este ticket se ha fusionado con SP-2026-0025 porque es el mismo incidente causado por el mismo bloqueo de la base de datos.<br>El seguimiento y la comunicación posteriores continuarán en el ticket representativo.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-07-06T07:13:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
