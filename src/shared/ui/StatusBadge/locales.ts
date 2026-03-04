import { Locale } from "@/shared/types";

import { SystemStatus } from "./types";

export const statusLocaleKey: Record<SystemStatus, string> = {
  Pre: "pre",
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
    pre: "Pre",
    open: "Open",
    approved: "Approved",
    declined: "Declined",
    working: "Working",
    pending: "Pending",
    resolved: "Resolved",
    closed: "Closed",
  },

  es: {
    pre: "Pre",
    open: "Abierto",
    approval: "Aprobación",
    approved: "Aprobado",
    declined: "Rechazado",
    working: "Trabajando",
    pending: "Pendiente",
    resolved: "Resuelto",
    closed: "Cerrado",
  },

  fr: {
    pre: "Pré",
    open: "Ouvrir",
    approval: "Approbation",
    approved: "Approuvé",
    declined: "Décliné",
    working: "Fonctionnement",
    pending: "En attente",
    resolved: "Résolu",
    closed: "Fermée",
  },

  ko: {
    pre: "임시",
    open: "신규",
    approved: "승인됨",
    declined: "거절됨",
    working: "작업 중",
    pending: "대기 중",
    resolved: "해결됨",
    closed: "완료",
  },
};
