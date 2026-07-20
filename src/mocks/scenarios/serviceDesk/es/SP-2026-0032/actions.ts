import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "APPROVE",
    tka_content: "Adrian Vega aprobó la solicitud.",
    tka_owner_username: "adrian_vega",
    tka_created_at: "2026-07-12T05:54:30Z",
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
      "Hola, Tessa.<br>Revisaremos en orden el telemetry collector, el message broker, el almacén de datos de generación y el proceso de generación de informes de Solar Farm A.",
    tka_owner_username: "bianca_davis",
    tka_created_at: "2026-07-12T06:12:18Z",
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
      "Los datos actuales siguen llegando al sistema de monitoreo externo. Solo Energy Operations Dashboard y el informe diario de generación muestran las 14:35 como el dato más reciente.",
    tka_owner_username: "tessa_ito",
    tka_created_at: "2026-07-12T06:35:42Z",
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
      "La recopilación interna de telemetry, el message broker, el almacén de datos de generación y el proceso de generación de informes funcionan correctamente, y los datos más recientes están almacenados. El error de sincronización solo se reproduce con la solicitud Refresh del Dashboard, por lo que consideramos que el problema está en la capa de integración del portal.<br>Cree un nuevo ticket con alcance Portal / System e incluya el mensaje de error y los resultados de esta revisión.",
    tka_owner_username: "bianca_davis",
    tka_created_at: "2026-07-12T07:52:36Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,
    tka_action_type: "COMMENT",
    tka_content:
      "He creado el ticket de Portal / System SP-2026-0033 con los resultados de la revisión y el error “Unable to synchronize telemetry data”.",
    tka_owner_username: "tessa_ito",
    tka_created_at: "2026-07-12T08:15:10Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      relatedTicketId: "d773a4a0-e4ab-4bb1-bd55-c3c3735c7bea",
      relatedTicketNo: "SP-2026-0033",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 6,
    tka_action_type: "COMMENT",
    tka_content:
      "Los resultados de la revisión se transfirieron mediante SP-2026-0033. Confirmamos que no existe ningún problema en el procesamiento interno de datos, por lo que este ticket se marcará como resuelto y el seguimiento continuará en el ticket del portal.",
    tka_owner_username: "bianca_davis",
    tka_created_at: "2026-07-12T08:18:04Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      relatedTicketId: "d773a4a0-e4ab-4bb1-bd55-c3c3735c7bea",
      relatedTicketNo: "SP-2026-0033",
    },
    tka_files: [],
    tka_images: [],
  },
];
