import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "2bba911c-893c-42f6-bce7-908c34035fd7",
  ticket_number: "SP-2026-0028",
  created_at: "2026-06-25T07:13:53Z",
  updated_at: "2026-06-26T01:18:10Z",
  requester_id: "vivian_long",
  status: "Pending",
  close_reason: null,
  priority: "medium",
  risk_level: "low",
  assignee_id: ["matthew_williams", "amelia_brown", "evan_seo"],
  merged_into_ticket_id: null,
  work_minutes: 0,
  last_comment_at: null,
  last_commenter_email: null,
  due_at: "2026-07-01T18:00:00Z",
  owner: false,
  assigned: true,
  active: true,
  scope: "PORTAL",
  category_id: "62",
  approval_step_id: null,
  subject:
    "Veuillez refléter le travail effectué le 24 dans le journal de travail",
  content:
    "Bonjour. Le 24, après le départ de tous les employés à 17 h 00, l?�équipe des installations a effectué un remplacement du câblage électrique.<br>Pour cette raison, nous n?�avons pas pu enregistrer notre départ.<br>Veuillez mettre à jour l?�heure de départ et les heures travaillées pour trois employés.<br><br>Jasper.Powell@sunghwan-portal.dev<br>Naomi.Jenkins@sunghwan-portal.dev<br>Connor.Peterson@sunghwan-portal.dev<br><br>Heure de fin du travail : 21 h 00.",
  email: {
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
  files: [],
  images: [],
};
