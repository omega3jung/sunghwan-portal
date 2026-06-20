import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "cc213257-9a7c-4e55-943d-7a4f07f2abe4",
  ticket_number: "SP-2026-0021",
  created_at: "2026-05-26T22:44:33Z",
  updated_at: "2026-05-27T14:38:25Z",
  requester_id: "liam_williams",
  status: "Resolved",
  priority: "medium",
  risk_level: "medium",
  assignee_id: ["evan_seo"],
  work_minutes: 60,
  last_comment_at: "2026-05-27T15:02:13Z",
  last_commenter_email: "liam.williams@sunghwan-portal.dev",
  due_at: "2026-06-02T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "INTERNAL",
  category_id: "72",
  approval_step_id: null,
  subject: "Demande de correction d'un identifiant d'appareil reçu",
  content:
    "Bonjour, nous avons constaté que l'un des identifiants d'appareil B4 reçus est incorrect.<br>Veuillez mettre à jour l'identifiant de l'appareil de 84321565 à 84321585.",
  email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "liam.williams@sunghwan-portal.dev"],
    cc: [
      "olivia.johnson@sunghwan-portal.dev",
      "emma.brown@sunghwan-portal.dev",
    ],
    bcc: [],
  },
  files: [],
  images: [],
};
