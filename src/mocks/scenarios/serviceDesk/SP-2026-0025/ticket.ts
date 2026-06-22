import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "4eafbeeb-aabf-40af-8914-fd6013c0b19c",
  tk_ticket_no: "SP-2026-0025",
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
  tk_subject: "L'écran d'expédition sortante reste bloqué sur le chargement",
  tk_content:
    "Lors du traitement des expéditions sortantes, l'écran d'exécution des expéditions continue d'afficher uniquement l'icône de chargement et ne se termine jamais.<br>Les utilisateurs de la logistique ne peuvent pas finaliser les transactions d'expédition sortante.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["Victor.Rivera@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
