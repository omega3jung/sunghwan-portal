import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "APPROVE",
    tka_content: "Elias Martinez aprobó la solicitud.",
    tka_owner_username: "elias_martinez",
    tka_created_at: "2026-07-09T08:29:25Z",
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
      "Hola, Fiona y Elias.<br>La factura de envío no puede enviarse porque este dispositivo se encuentra en el área de QC. Transfiera el dispositivo al muelle de envío e inténtelo de nuevo.",
    tka_owner_username: "evan_seo",
    tka_created_at: "2026-07-09T09:15:53Z",
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
      "Espera, Evan. Un gerente de Demo Corporation nos pidió que esto quedara resuelto hoy. Da prioridad a la solicitud.",
    tka_owner_username: "fiona_tanaka",
    tka_created_at: "2026-07-09T10:01:58Z",
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
      "Entendido, Fiona. Trasladaré el dispositivo 357849216854353 al muelle de envío y lo procesaré.",
    tka_owner_username: "evan_seo",
    tka_created_at: "2026-07-09T10:17:18Z",
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
      "Confirmamos que se envió la factura de envío del dispositivo 357849216854353. Verifique el resultado y continúe con los siguientes pasos.",
    tka_owner_username: "evan_seo",
    tka_created_at: "2026-07-09T12:43:05Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
