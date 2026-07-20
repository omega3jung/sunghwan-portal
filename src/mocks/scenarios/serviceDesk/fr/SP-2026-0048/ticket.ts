import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "4304ae99-49ae-4606-9aab-ac6edde8db0a",
  tk_ticket_no: "SP-2026-0048",
  tk_created_at: "2026-07-08T07:13:53Z",
  tk_updated_at: "2026-07-09T01:18:10Z",
  tk_requester_username: "vivian_long",
  tk_status: "Pending",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["matthew_williams", "amelia_brown", "evan_seo"],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,

  tka_last_user_activity_at: "2026-07-09T01:17:18Z",
  tka_last_user_activity_email: "Amelia.Brown@sunghwan-portal.dev",
  tk_due_at: "2026-07-14T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "62",
  cat_name: {
    en: "Work log / attendance issue",
    es: "Problema de registro laboral / asistencia",
    fr: "Problème de pointage / présence",
    ko: "근무 일지 / 출근 문제",
  },
  tk_approval_step_id: null,
  tk_subject:
    "Veuillez refléter le travail effectué le 24 dans le journal de travail",
  tk_content:
    "Bonjour. Le 24, après le départ de tous les employés à 17 h 00, l?�équipe des installations a effectué un remplacement du câblage électrique.<br>Pour cette raison, nous n?�avons pas pu enregistrer notre départ.<br>Veuillez mettre à jour l?�heure de départ et les heures travaillées pour trois employés.<br><br>Jasper.Powell@sunghwan-portal.dev<br>Naomi.Jenkins@sunghwan-portal.dev<br>Connor.Peterson@sunghwan-portal.dev<br><br>Heure de fin du travail : 21 h 00.",
  tk_email: {
    to: [
      "Matthew.Williams@sunghwan-portal.dev",
      "Amelia.Brown@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
    ],
    cc: [
      "Jasper.Powell@sunghwan-portal.dev",
      "Naomi.Jenkins@sunghwan-portal.dev",
      "Connor.Peterson@sunghwan-portal.dev",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
