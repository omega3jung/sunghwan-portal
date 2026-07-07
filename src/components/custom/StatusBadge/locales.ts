import { Locale } from "@/shared/types";

import { SystemStatus } from "./types";

export const statusLocaleKey: Record<SystemStatus, string> = {
  Draft: "draft",
  Approval: "approval",
  Declined: "declined",
  Assigned: "assigned",
  Working: "working",
  Pending: "pending",
  Resolved: "resolved",
  Rejected: "rejected",
  Reopened: "reopened",
  Closed: "closed",
};

export const statusBadgeLocales: Record<Locale, Record<string, string>> = {
  en: {
    draft: "Draft",
    open: "Open",
    approval: "Waiting approval",
    declined: "Declined",
    assigned: "Assigned",
    working: "Working",
    pending: "Pending",
    rejected: "Rejected",
    resolved: "Resolved",
    reopened: "Reopened",
    closed: "Closed",
  },

  es: {
    draft: "Borrador",
    open: "Abierto",
    approval: "Pendiente de aprobacion",
    declined: "Rechazado",
    assigned: "Asignado",
    working: "Trabajando",
    pending: "Pendiente",
    rejected: "Rechazado",
    resolved: "Resuelto",
    reopened: "Reabierto",
    closed: "Cerrado",
  },

  fr: {
    draft: "Brouillon",
    open: "Ouvert",
    approval: "En attente d'approbation",
    declined: "Refuse",
    assigned: "Assigne",
    working: "En cours",
    pending: "En attente",
    rejected: "Rejete",
    resolved: "Resolue",
    reopened: "Rouverte",
    closed: "Ferme",
  },

  ko: {
    draft: "임시",
    open: "열림",
    approval: "승인 대기",
    declined: "반려됨",
    assigned: "배정됨",
    working: "처리 중",
    pending: "대기 중",
    rejected: "반려됨",
    resolved: "해결됨",
    reopened: "재처리",
    closed: "종료됨",
  },
};
