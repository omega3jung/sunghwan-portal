import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "cc213257-9a7c-4e55-943d-7a4f07f2abe4",
  tk_ticket_no: "SP-2026-0041",
  tk_created_at: "2026-07-01T22:44:33Z",
  tk_updated_at: "2026-07-02T14:38:25Z",
  tk_requester_username: "liam_williams",
  tk_status: "Resolved",
  tk_priority: "medium",
  tk_risk_level: "medium",
  tk_assignee_usernames: ["evan_seo"],
  tk_work_minutes: 60,
  tka_last_comment_at: "2026-07-02T15:02:13Z",
  tka_last_comment_email: "liam.williams@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-02T15:02:13Z",
  tka_last_user_activity_email: "liam.williams@sunghwan-portal.dev",
  tk_due_at: "2026-07-08T18:00:00Z",
  tk_active: true,
  cat_scope: "INTERNAL",
  cat_id: "72",
  cat_name: {
    en: "Data correction request",
    es: "Solicitud de corrección de datos",
    fr: "Demande de correction de données",
    ko: "데이터 수정 요청",
  },
  tk_approval_step_id: null,
  tk_subject: "Demande de correction d'un identifiant d'appareil reçu",
  tk_content:
    "Bonjour, nous avons constaté que l'un des identifiants d'appareil B4 reçus est incorrect.<br>Veuillez mettre à jour l'identifiant de l'appareil de 84321565 à 84321585.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "liam.williams@sunghwan-portal.dev"],
    cc: [
      "olivia.johnson@sunghwan-portal.dev",
      "emma.brown@sunghwan-portal.dev",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
