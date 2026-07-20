import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "e0f25da0-de81-4cd3-905f-0eb2904c3e0e",
  tk_ticket_no: "SP-2026-0029",
  tk_created_at: "2026-07-09T08:13:53Z",
  tk_updated_at: "2026-07-09T12:45:10Z",
  tk_requester_username: "fiona_tanaka",
  tk_status: "Resolved",
  tk_priority: "urgent",
  tk_risk_level: "high",
  tk_assignee_usernames: [
    "olivia_park",
    "lucas_han",
    "logan_baek",
    "noah_yoon",
    "ella_nam",
    "evan_seo",
  ],
  tk_work_minutes: 60,
  tka_last_comment_at: "2026-07-09T12:43:05Z",
  tka_last_comment_email: "Evan.Seo@sunghwan-portal.dev",
  tka_last_user_activity_at: "2026-07-09T12:43:05Z",
  tka_last_user_activity_email: "Evan.Seo@sunghwan-portal.dev",
  tk_due_at: "2026-07-10T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "108",
  cat_name: {
    en: "Feature Behavior Issues",
    es: "Problemas de comportamiento de funciones",
    fr: "Problèmes de comportement des fonctionnalités",
    ko: "기능 동작 문제",
  },
  tk_approval_step_id: null,
  tk_subject:
    "Error al enviar la factura de envío en la página End-to-End Unit Repair",
  tk_content:
    "Hola. Al seleccionar el botón para enviar la factura de envío del dispositivo 357849216854353 en la página End-to-End Unit Repair, aparece una notificación de error. Resuelva el problema para que el dispositivo pueda enviarse lo antes posible.",
  tk_email: {
    to: [
      "Olivia.Park@sunghwan-portal.dev",
      "Lucas.Han@sunghwan-portal.dev",
      "Logan.Baek@sunghwan-portal.dev",
      "Noah.Yoon@sunghwan-portal.dev",
      "Ella.Nam@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
      "fiona.tanaka@client-demo-corporation.com",
    ],
    cc: ["elias.martinez@client-demo-corporation.com"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [
    {
      index: 1,
      type: "image",
      name: "ticket_image-1.png",
      url: "/_mocks/scenarios/serviceDesk/ticket-2026-9/ticket_image-1.png",
      active: true,
    },
  ],
};
