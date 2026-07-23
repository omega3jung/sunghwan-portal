import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "bf76be45-9d83-4d5e-83dc-edafc97dd02b",
  tk_ticket_no: "SP-2026-0047",
  tk_created_at: "2026-07-07T01:13:27Z",
  tk_updated_at: "2026-07-07T02:41:12Z",
  tk_requester_username: "james_smith",
  tk_requester: {
    username: "james_smith",
    name: {
      en: { first: "James", middle: "", last: "Smith" },
    },
    email: "james.smith@sunghwan-portal.dev",
    image: null,
  },
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
    "Demande de verrouillage du compte d’une responsable Réparation ayant quitté l’entreprise - Aria Young",
  tk_content:
    "Bonjour. Aria Young, responsable de l’équipe de réparation des appareils autres que les téléphones, a quitté l’entreprise le 23 juin 2026.<br><br>Veuillez verrouiller immédiatement le compte aria.young@sunghwan-portal.dev et révoquer toutes les sessions actives, les inscriptions MFA et les jetons d’API. Une fois les opérations de sécurité terminées, demandez aux Ressources humaines de confirmer le départ de l’employée et la clôture requise du compte.",
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
