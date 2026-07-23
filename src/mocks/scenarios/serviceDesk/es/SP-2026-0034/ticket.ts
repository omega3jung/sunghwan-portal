import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "d9ba14ec-989b-46be-a211-79cc138fd3d8",
  tk_ticket_no: "SP-2026-0034",
  tk_created_at: "2026-07-14T01:13:27Z",
  tk_updated_at: "2026-07-14T01:18:10Z",
  tk_requester_username: "__demo_user__",
  tk_requester: {
    username: "__demo_user__",
    name: {
      en: { first: "Demo", middle: "", last: "User" },
    },
    email: "demoUser@sunghwan-portal.dev",
    image: null,
  },
  tk_status: "Assigned",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["__demo_admin__", "__demo_manager__"],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,

  tka_last_user_activity_at: "2026-07-14T01:18:10Z",
  tka_last_user_activity_email: null,
  tk_due_at: "2026-07-18T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "22",
  cat_name: {
    en: "New device request (PC / Laptop / Mobile)",
    es: "Solicitud de nuevo dispositivo (PC / Portátil / Móvil)",
    fr: "Demande de nouvel appareil (PC / Ordinateur portable / Mobile)",
    ko: "새로운 기기 요청",
  },
  tk_approval_step_id: null,
  tk_subject: "Prueba de inicio automático de ticket aprobado",
  tk_content:
    "Este ticket está preparado para probar el flujo de actualización automática del estado.<br>Cuando el usuario asignado abre la vista de detalle del ticket mientras el estado del ticket es 'Assigned', el estado debería cambiar automáticamente a 'Working'.",
  tk_email: {
    to: ["demoAdmin@sunghwan-portal.dev"],
    cc: ["demoUser@sunghwan-portal.dev", "demoManager@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
