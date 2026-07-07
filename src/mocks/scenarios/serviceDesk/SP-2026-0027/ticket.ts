import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "e3378b48-32dd-49ff-84a8-05498c60077c",
  tk_ticket_no: "SP-2026-0027",
  tk_created_at: "2026-06-24T01:13:27Z",
  tk_updated_at: "2026-06-24T01:18:10Z",
  tk_requester_username: "__demo_user__",
  tk_status: "Assigned",
  tk_close_reason: null,
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["__demo_admin__", "__demo_manager__"],
  tk_merged_into_ticket_id: null,
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,

  tka_last_user_activity_at: "2026-06-24T01:18:10Z",
  tka_last_user_activity_email: null,
  tk_due_at: "2026-06-30T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "92",
  cat_name: {
    en: "General inquiry",
    es: "Consulta general",
    fr: "Demande générale",
    ko: "일반 문의",
  },
  tk_approval_step_id: null,
  tk_subject: "Test de démarrage automatique d'un ticket assigné",
  tk_content:
    "Ce ticket est préparé pour tester le flux de mise à jour automatique du statut.<br>Lorsque l'utilisateur assigné ouvre la vue détaillée du ticket alors que son statut est 'Assigned', le statut doit automatiquement passer à 'Working'.",
  tk_email: {
    to: ["demoAdmin@sunghwan-portal.dev"],
    cc: ["demoUser@sunghwan-portal.dev", "demoManager@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
