import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "b04e381c-b1db-4995-9da4-4a14dc0732bd",
  tk_ticket_no: "SP-2026-0050",
  tk_created_at: "2026-07-10T17:13:53Z",
  tk_updated_at: "2026-07-10T20:18:10Z",
  tk_requester_username: "samuel_anderson",
  tk_status: "Resolved",
  tk_priority: "high",
  tk_risk_level: "high",
  tk_assignee_usernames: ["adrian_usman", "yusuf_garcia", "zoe_novak"],
  tk_work_minutes: 155,
  tka_last_comment_at: "2026-07-10T20:17:18Z",
  tka_last_comment_email: "adrian.usman@client-demo-corporation.com",
  tka_last_user_activity_at: "2026-07-10T20:17:18Z",
  tka_last_user_activity_email: "adrian.usman@client-demo-corporation.com",
  tk_due_at: "2026-07-12T18:00:00Z",
  tk_active: true,
  cat_scope: "INTERNAL",
  cat_id: "116",
  cat_name: {
    en: "Access permission change",
    es: "Cambio de permisos de acceso",
    fr: "Modification des autorisations d’accès",
    ko: "계정 권한 변경",
  },
  tk_approval_step_id: null,
  tk_subject: "Demande d’accès aux tickets du portail",
  tk_content:
    "Bonjour. Tessa Hassan doit accéder aux tickets du portail. Veuillez lui accorder l’autorisation nécessaire.<br>tessa.hassan@client-demo-corporation.com<br><br>",
  tk_email: {
    to: [
      "adrian.usman@client-demo-corporation.com",
      "yusuf.garcia@client-demo-corporation.com",
      "zoe.novak@client-demo-corporation.com",
      "samuel.anderson@client-demo-corporation.com",
    ],
    cc: [
      "quentin.wilson@client-demo-corporation.com",
      "tessa.hassan@client-demo-corporation.com",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
