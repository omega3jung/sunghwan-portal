import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "36c6a1a1-4bf9-4e4c-b626-8753f9f21d36",
  tk_ticket_no: "SP-2026-0036",
  tk_created_at: "2026-07-16T01:13:27Z",
  tk_updated_at: "2026-07-16T01:18:09Z",
  tk_requester_username: "__demo_user__",
  tk_status: "Declined",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: [],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,
  tka_last_user_activity_at: "2026-07-16T01:18:09Z",
  tka_last_user_activity_email: "demoManager@sunghwan-portal.dev",
  tk_due_at: "2026-07-20T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "85",
  cat_name: {
    en: "Client issue inquiry",
    es: "Consulta sobre problemas del cliente",
    fr: "Demande concernant un problème client",
    ko: "고객사 문제 문의",
  },
  tk_approval_step_id: null,
  tk_subject: "Prueba de la acción Reenviar solicitud",
  tk_content:
    "Este ticket está preparado para probar la acción Reenviar solicitud.<br>El solicitante debe poder actualizar y reenviar el ticket mientras se encuentra en el estado 'Declined'.",
  tk_email: {
    to: ["demoManager@sunghwan-portal.dev"],
    cc: ["demoUser@sunghwan-portal.dev", "demoAdmin@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
