import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "974542c7-247d-42c6-abbf-f27e307e8fa3",
  tk_ticket_no: "SP-2026-0012",
  tk_created_at: "2026-05-27T02:44:33Z",
  tk_updated_at: "2026-05-27T09:18:42Z",
  tk_requester_username: "liam_williams",
  tk_status: "Resolved",
  tk_priority: "medium",
  tk_risk_level: "high",
  tk_assignee_usernames: ["evan_seo"],
  tk_work_minutes: 30,
  tka_last_comment_at: "2026-05-27T09:15:11Z",
  tka_last_comment_email: "Evan.Seo@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-05-27T09:15:28Z",
  tka_last_user_activity_email: "Evan.Seo@sunghwan-portal.dev",
  tk_due_at: "2026-05-31T18:00:00Z",
  tk_active: true,
  cat_scope: "INTERNAL",
  cat_id: "75",
  cat_name: {
    en: "Data export request",
    es: "Solicitud de exportación de datos",
    fr: "Demande d’exportation de données",
    ko: "데이터 반출 요청",
  },
  tk_approval_step_id: null,
  tk_subject: "Solicitud de informe de recepción para SKU-12345",
  tk_content:
    "Hola, solicitamos al cliente el informe de recepción de todos los dispositivos SKU-12345 para comprobar que la información sea correcta.<br>Por favor envíenlo lo antes posible.",
  tk_email: {
    to: [
      "isabella.martinez@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
    ],
    cc: [
      "benjamin.rodriguez@sunghwan-portal.dev",
      "lucas.hernandez@sunghwan-portal.dev",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
