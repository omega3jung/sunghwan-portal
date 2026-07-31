import type { TicketStep } from "./types";

/** Defines the max email count policy shared by this feature's client workflows. */
export const MAX_EMAIL_COUNT = 10;
/** Defines the max attach count policy shared by this feature's client workflows. */
export const MAX_ATTACH_COUNT = 10;
/** Defines the max attach size policy shared by this feature's client workflows. */
export const MAX_ATTACH_SIZE = 100; // MB
/** Defines the allowed ticket attachment extensions policy shared by this feature's client workflows. */
export const ALLOWED_TICKET_ATTACHMENT_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "txt",
  "log",
  "csv",
  "json",
  "xlsx",
  "docx",
  "pptx",
  "pdf",
  "zip",
  "7z",
] as const;
/** Defines the ticket attachment accept policy shared by this feature's client workflows. */
export const TICKET_ATTACHMENT_ACCEPT = ALLOWED_TICKET_ATTACHMENT_EXTENSIONS.map(
  (extension) => `.${extension}`,
);

/** Defines the create step data policy shared by this feature's client workflows. */
export const createStepData = ["issueDetails", "attachments", "review"];
/** Defines the after step data policy shared by this feature's client workflows. */
export const afterStepData = ["assign"];

/** Defines the ticket step policy shared by this feature's client workflows. */
export const ticketStep: Record<TicketStep, number> = {
  info: 0,
  attachment: 1,
  review: 2,
} as const;
