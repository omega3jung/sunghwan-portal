import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "70d38856-b21d-4784-aa48-9e6a80e9db35",
  tk_ticket_no: "SP-2026-0015",
  tk_created_at: "2026-06-02T06:03:14Z",
  tk_updated_at: "2026-06-02T07:21:42Z",
  tk_requester_username: "grant_murphy",
  tk_status: "Resolved",
  tk_close_reason: null,
  tk_priority: "high",
  tk_risk_level: "high",
  tk_assignee_usernames: ["evan_seo", "daniel_kim"],
  tk_merged_into_ticket_id: null,
  tk_work_minutes: 105,
  tka_last_comment_at: "2026-06-02T07:21:42Z",
  tka_last_comment_email: "Daniel.Kim@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-06-02T07:21:42Z",
  tka_last_user_activity_email: "Daniel.Kim@sunghwan-portal.dev",
  tk_due_at: "2026-06-03T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "5",
  cat_name: {
    en: "Performance / Availability",
    es: "Rendimiento / disponibilidad",
    fr: "Performance / disponibilité",
    ko: "성능 / 사용성",
  },
  tk_approval_step_id: null,
  tk_subject: "La pantalla de envío de salida se queda cargando",
  tk_content:
    "Al procesar envíos de salida, la pantalla de ejecución de envíos sigue mostrando solo el icono de carga y nunca termina.<br>Los usuarios de logística no pueden finalizar las transacciones de envío de salida.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["Victor.Rivera@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
