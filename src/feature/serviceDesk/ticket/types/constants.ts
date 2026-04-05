import { TicketStep } from "./steps";

export const MAX_EMAIL_COUNT = 10;
export const MAX_ATTACH_COUNT = 10;
export const MAX_ATTACH_SIZE = 100; // MB

export const createStepData = ["issueDetails", "attachments", "review"];
export const afterStepData = ["assign"];

export const ticketStep: Record<TicketStep, number> = {
  info: 0,
  attachment: 1,
  review: 2,
} as const;
