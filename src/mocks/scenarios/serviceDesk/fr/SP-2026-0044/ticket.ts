import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "979af2f3-ea36-4395-b48c-436b9752f446",
  tk_ticket_no: "SP-2026-0044",
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
    "Demande d'extension du droit de modification de Unit ID au personnel de réparation",
  tk_content:
    "Pendant les opérations de réparation, les erreurs de saisie sur Unit ID se produisent fréquemment et les demandes de correction prennent trop de temps.<br>Actuellement, la modification de Unit ID est autorisée uniquement au niveau leader et au-dessus.<br>Veuillez également accorder le droit de modification de Unit ID aux Repair Technicians.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["liam.williams@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
