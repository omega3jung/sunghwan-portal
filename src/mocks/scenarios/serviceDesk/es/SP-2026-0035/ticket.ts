import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "cc65d312-414a-4c23-a5c5-721b2a3ea141",
  tk_ticket_no: "SP-2026-0035",
  tk_created_at: "2026-07-15T01:13:27Z",
  tk_updated_at: "2026-07-15T01:13:28Z",
  tk_requester_username: "__demo_user__",
  tk_status: "Approval",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["__demo_manager__"],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,
  tka_last_user_activity_at: "2026-07-15T01:13:27Z",
  tka_last_user_activity_email: "demoUser@sunghwan-portal.dev",
  tk_due_at: "2026-07-19T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "85",
  cat_name: {
    en: "Client issue inquiry",
    es: "Consulta sobre problemas del cliente",
    fr: "Demande concernant un problème client",
    ko: "고객사 문제 문의",
  },
  tk_approval_step_id: "9",
  tk_subject: "Prueba de las acciones Aprobar y Declinar",
  tk_content:
    "Este ticket está preparado para probar las acciones Aprobar y Declinar.<br>El aprobador actual debe poder aprobar o declinar el ticket mientras se encuentra en el estado 'Approval'.",
  tk_email: {
    to: ["demoManager@sunghwan-portal.dev"],
    cc: ["demoUser@sunghwan-portal.dev", "demoAdmin@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
