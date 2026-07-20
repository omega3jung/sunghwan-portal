import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "f9a42ead-9d7b-455e-89d9-33f16001a67b",
  tk_ticket_no: "SP-2026-0027",
  tk_created_at: "2026-07-07T01:13:27Z",
  tk_updated_at: "2026-07-07T02:41:12Z",
  tk_requester_username: "james_smith",
  tk_status: "Resolved",
  tk_priority: "high",
  tk_risk_level: "high",
  tk_assignee_usernames: [
    "isabella_oh",
    "julian_moon",
    "benjamin_hong",
    "aria_jeon",
    "matthew_williams",
  ],
  tk_work_minutes: 85,
  tka_last_comment_at: "2026-07-07T02:40:06Z",
  tka_last_comment_email: "Julian.Moon@sunghwan-portal.dev",
  tka_last_user_activity_at: "2026-07-07T02:40:06Z",
  tka_last_user_activity_email: "Julian.Moon@sunghwan-portal.dev",
  tk_due_at: "2026-07-08T18:00:00Z",
  tk_active: true,
  cat_scope: "INTERNAL",
  cat_id: "16",
  cat_name: {
    en: "Account lock / unlock",
    es: "Bloqueo / desbloqueo de cuenta",
    fr: "Verrouillage / déverrouillage du compte",
    ko: "계정 잠금 / 해제",
  },
  tk_approval_step_id: null,
  tk_subject:
    "Solicitud de bloqueo de cuenta de una gerente de Reparaciones que dejó la empresa - Aria Young",
  tk_content:
    "Hola. Aria Young, gerente del equipo de reparación de dispositivos que no son teléfonos, dejó la empresa con efecto el 23 de junio de 2026.<br><br>Bloquee inmediatamente la cuenta aria.young@sunghwan-portal.dev y revoque todas las sesiones activas, los registros de MFA y los tokens de API. Cuando finalice el trabajo de seguridad, solicite a Recursos Humanos que confirme la baja de la empleada y que la cuenta debe cerrarse.",
  tk_email: {
    to: [
      "Isabella.Oh@sunghwan-portal.dev",
      "Julian.Moon@sunghwan-portal.dev",
      "Benjamin.Hong@sunghwan-portal.dev",
      "Aria.Jeon@sunghwan-portal.dev",
      "Matthew.Williams@sunghwan-portal.dev",
      "james.smith@sunghwan-portal.dev",
    ],
    cc: ["Charlotte.Johnson@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
