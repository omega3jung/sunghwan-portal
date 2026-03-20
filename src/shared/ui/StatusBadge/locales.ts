import { Locale } from "@/shared/types";

import { SystemStatus } from "./types";

export const statusLocaleKey: Record<SystemStatus, string> = {
  Draft: "draft",
  Open: "open",
  Approved: "approved",
  Declined: "declined",
  Working: "working",
  Pending: "pending",
  Resolved: "resolved",
  Closed: "closed",
};

export const statusBadgeLocales: Record<Locale, Record<string, string>> = {
  en: {
    draft: "Draft",
    open: "Open",
    approved: "Approved",
    declined: "Declined",
    working: "Working",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
  },

  es: {
    draft: "Borrador",
    open: "Abierto",
    approval: "Aprobacion",
    approved: "Aprobado",
    declined: "Rechazado",
    working: "Trabajando",
    pending: "Pendiente",
    resolved: "Resuelto",
    closed: "Cerrado",
  },

  fr: {
    draft: "Brouillon",
    open: "Ouvert",
    approval: "Approbation",
    approved: "Approuve",
    declined: "Refuse",
    working: "En cours",
    pending: "En attente",
    resolved: "Resolue",
    closed: "Ferme",
  },

  ko: {
    draft: "임시",
    open: "열림",
    approved: "승인됨",
    declined: "거절됨",
    working: "작업 중",
    pending: "대기 중",
    resolved: "해결됨",
    closed: "완료",
  },
};
