import type { TicketStep } from "./types";

export const MAX_EMAIL_COUNT = 10;
export const MAX_ATTACH_COUNT = 10;
export const MAX_ATTACH_SIZE = 100; // MB
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
export const TICKET_ATTACHMENT_ACCEPT = ALLOWED_TICKET_ATTACHMENT_EXTENSIONS.map(
  (extension) => `.${extension}`,
);

export const createStepData = ["issueDetails", "attachments", "review"];
export const afterStepData = ["assign"];

export const ticketStep: Record<TicketStep, number> = {
  info: 0,
  attachment: 1,
  review: 2,
} as const;
