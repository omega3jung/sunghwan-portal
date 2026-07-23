export const NS = {
  auth: "auth",
  common: "common",
  domain: "domain",
  documents: "documents",
  dashboard: "dashboard",
  demo: "demo",
  error: "error",
  message: "message",
  serviceDesk: "serviceDesk",
  settings: "settings",
  validation: "validation",
} as const;

export type Namespace = (typeof NS)[keyof typeof NS];
