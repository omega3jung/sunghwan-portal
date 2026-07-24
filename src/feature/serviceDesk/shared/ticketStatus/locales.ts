import type { TicketStatus } from "@/domain/serviceDesk";
import { Locale } from "@/shared/types";

export const ticketStatusLocaleKey: Record<TicketStatus, string> = {
  Draft: "draft",
  Approval: "approval",
  Declined: "declined",
  Assigned: "assigned",
  Working: "working",
  Pending: "pending",
  Resolved: "resolved",
  Rejected: "rejected",
  Closed: "closed",
};

export const ticketStatusLocales: Record<Locale, Record<string, string>> = {
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
    closed: "Ferme",
  },

  ko: {
    draft: "임시",
    open: "열림",
    approval: "승인 대기",
    declined: "승인 반려",
    assigned: "배정됨",
    working: "처리 중",
    pending: "대기 중",
    rejected: "반려됨",
    resolved: "해결됨",
    closed: "종료됨",
  },
};
