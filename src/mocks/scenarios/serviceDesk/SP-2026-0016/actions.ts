import { DbTicketAction } from "@/feature/serviceDesk/ticketAction";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hola, Liam.<br>Estamos revisando este problema con el equipo de backend ahora.<br>Confirma qué pasos del proceso están bloqueados para el equipo de reparación.",
    owner_id: "41",

    created_at: "2026-04-02T06:22:11Z",
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
      "Recepción, reparación y control de calidad están todos bloqueados.<br>Todas las pantallas afectadas siguen mostrando solo el icono de carga y los usuarios no pueden continuar.",
    owner_id: "53",

    created_at: "2026-04-02T06:25:44Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "MERGE",
    content:
      "Este ticket se ha fusionado con SP-2026-0015 porque es el mismo incidente causado por el mismo bloqueo de la base de datos.<br>El seguimiento y la comunicación posteriores continuarán en el ticket representativo.",
    owner_id: "31",

    created_at: "2026-04-02T07:13:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
