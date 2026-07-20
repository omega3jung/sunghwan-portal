import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "ca0eeedb-98b6-40da-9a03-01633eb53ebf",
  tk_ticket_no: "SP-2026-0024",
  tk_created_at: "2026-07-04T16:25:38Z",
  tk_updated_at: "2026-07-05T03:22:49Z",
  tk_requester_username: "olivia_johnson",
  tk_status: "Rejected",
  tk_close_reason: "Rejected",
  tk_priority: "medium",
  tk_risk_level: "medium",
  tk_assignee_usernames: ["evan_seo", "daniel_kim"],
  tk_work_minutes: 95,
  tka_last_comment_at: "2026-07-05T03:22:49Z",
  tka_last_comment_email: "Daniel.Kim@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-05T03:22:49Z",
  tka_last_user_activity_email: "Daniel.Kim@sunghwan-portal.dev",
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
  tk_subject:
    "Solicitud para ampliar el permiso de edición de Unit ID al personal de reparación",
  tk_content:
    "Durante el trabajo de reparación, los errores de entrada en Unit ID ocurren con frecuencia y las solicitudes de corrección tardan demasiado.<br>Actualmente, la modificación de Unit ID solo está permitida para el nivel de líder o superior.<br>Por favor, concedan también el permiso de edición de Unit ID a los Repair Technicians.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["liam.williams@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
