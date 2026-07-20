import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "55d7b2b2-5c0a-4f5d-a737-98640a032e55",
  tk_ticket_no: "SP-2026-0055",
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
  tk_subject: "Test des actions Approuver et Refuser",
  tk_content:
    "Ce ticket est préparé pour tester les actions Approuver et Refuser.<br>L'approbateur actuel doit pouvoir approuver ou refuser le ticket lorsqu'il est au statut 'Approval'.",
  tk_email: {
    to: ["demoManager@sunghwan-portal.dev"],
    cc: ["demoUser@sunghwan-portal.dev", "demoAdmin@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
