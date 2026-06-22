import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "01ee8559-41a6-4fbf-b4bc-7a6680e9d413",
  tk_ticket_no: "SP-2026-0018",
  tk_created_at: "2026-06-25T07:13:53Z",
  tk_updated_at: "2026-06-26T01:18:10Z",
  tk_requester_username: "vivian_long",
  tk_status: "Pending",
  tk_close_reason: null,
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["matthew_williams", "amelia_brown", "evan_seo"],
  tk_merged_into_ticket_id: null,
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,

  tka_last_user_activity_at: "2026-06-26T01:17:18Z",
  tka_last_user_activity_email: "Amelia.Brown@sunghwan-portal.dev",
  tk_due_at: "2026-07-01T18:00:00Z",
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
    "Por favor, refleja el trabajo fuera de horario del día 24 en el registro de trabajo",
  tk_content:
    "Hola. El día 24, después de que todos los empleados salieron a las 5:00 PM, el equipo de Instalaciones realizó un trabajo de reemplazo del cableado eléctrico.<br>Debido a esto, no pudimos registrar la salida.<br>Por favor, actualiza la hora de salida y las horas trabajadas de tres empleados.<br><br>Jasper.Powell@sunghwan-portal.dev<br>Naomi.Jenkins@sunghwan-portal.dev<br>Connor.Peterson@sunghwan-portal.dev<br><br>Hora de finalización del trabajo: 9:00 PM.",
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
