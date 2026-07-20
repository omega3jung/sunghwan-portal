import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "1bf592ce-f54d-4fd2-8939-63f037e61962",
  tk_ticket_no: "SP-2026-0046",
  tk_created_at: "2026-07-06T06:13:27Z",
  tk_updated_at: "2026-07-06T07:13:18Z",
  tk_requester_username: "liam_williams",
  tk_status: "Closed",
  tk_close_reason: "Merged",
  tk_priority: "high",
  tk_risk_level: "high",
  tk_assignee_usernames: ["evan_seo", "daniel_kim"],
  tk_merged_into_ticket_id: "bc65af84-078d-4c52-b614-ff0a41514acb",
  tk_merged_into_ticket_no: "SP-2026-0045",
  tk_work_minutes: 20,
  tka_last_comment_at: "2026-07-06T07:13:18Z",
  tka_last_comment_email: "Daniel.Kim@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-06T07:13:18Z",
  tka_last_user_activity_email: "Daniel.Kim@sunghwan-portal.dev",
  tk_due_at: "2026-07-07T18:00:00Z",
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
    "Les écrans de réception, de réparation et de contrôle qualité restent bloqués sur le chargement",
  tk_content:
    "Les utilisateurs de la réception, de la réparation et du contrôle qualité ne voient que l?�indicateur de chargement et ne peuvent pas poursuivre les transactions.<br>Le problème apparaît à plusieurs étapes du portail, pas seulement sur un seul écran.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["olivia.johnson@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
