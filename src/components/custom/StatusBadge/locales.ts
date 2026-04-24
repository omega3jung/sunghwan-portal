import { Locale } from "@/shared/types";

import { SystemStatus } from "./types";

export const statusLocaleKey: Record<SystemStatus, string> = {
  Draft: "draft",
  Open: "open",
  Reopen: "reopen",
  Approved: "approved",
  Declined: "declined",
  Working: "working",
  Pending: "pending",
  Resolved: "resolved",
  Rejected: "rejected",
  Closed: "closed",
};

export const statusBadgeLocales: Record<Locale, Record<string, string>> = {
  en: {
    draft: "Draft",
    open: "Open",
    reopen: "Reopen",
    approved: "Approved",
    declined: "Declined",
    working: "Working",
    pending: "Pending",
    rejected: "Rejected",
    resolved: "Resolved",
    closed: "Closed",
  },

  es: {
    draft: "Borrador",
    open: "Abierto",
    reopen: "Reabierto",
    approval: "Aprobacion",
    approved: "Aprobado",
    declined: "Rechazado",
    working: "Trabajando",
    pending: "Pendiente",
    rejected: "Rechazado",
    resolved: "Resuelto",
    closed: "Cerrado",
  },

  fr: {
    draft: "Brouillon",
    open: "Ouvert",
    reopen: "Rouvert",
    approval: "Approbation",
    approved: "Approuve",
    declined: "Refuse",
    working: "En cours",
    pending: "En attente",
    rejected: "Rejete",
    resolved: "Resolue",
    closed: "Ferme",
  },

  ko: {
    draft: "임시",
    open: "열림",
    approved: "승인됨",
    declined: "반려됨",
    working: "처리 중",
    pending: "대기 중",
    rejected: "반려됨",
    resolved: "해결됨",
    closed: "종료됨",
  },
};
