import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "0320cad6-68c3-4e48-aced-1eb93014e225",
  tk_ticket_no: "SP-2026-0016",
  tk_created_at: "2026-06-02T06:13:27Z",
  tk_updated_at: "2026-06-02T07:13:18Z",
  tk_requester_username: "liam_williams",
  tk_status: "Closed",
  tk_close_reason: "Merged",
  tk_priority: "high",
  tk_risk_level: "high",
  tk_assignee_usernames: ["evan_seo", "daniel_kim"],
  tk_merged_into_ticket_id: "s70d38856-b21d-4784-aa48-9e6a80e9db35",
  tk_merged_into_ticket_no: "SP-2026-0015",
  tk_work_minutes: 20,
  tka_last_comment_at: "2026-06-02T07:13:18Z",
  tka_last_comment_email: "Daniel.Kim@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-06-02T07:13:18Z",
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
  tk_subject:
    "Las pantallas de recepción, reparación y control de calidad se quedan cargando",
  tk_content:
    "Los usuarios de recepción, reparación y control de calidad solo ven el indicador de carga y no pueden continuar con las transacciones.<br>El problema aparece en varios pasos del portal, no solo en una pantalla.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["olivia.johnson@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
