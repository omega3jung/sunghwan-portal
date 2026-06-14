import { z } from "zod";

import { TICKET_WORK_SESSION_NOTE_MAX_LENGTH } from "../constants";

export const WORK_SESSION_VALIDATION_KEY = {
  required: "validation.workSession.required",
  positive: "validation.workSession.positive",
  invalidRange: "validation.workSession.invalidRange",
  noteMaxLength: "validation.workSession.noteMaxLength",
} as const;

const optionalNoteSchema = z
  .string()
  .trim()
  .max(
    TICKET_WORK_SESSION_NOTE_MAX_LENGTH,
    WORK_SESSION_VALIDATION_KEY.noteMaxLength,
  )
  .optional()
  .transform((value) => value ?? "");

export const ticketTrackRangeFormSchema = z
  .object({
    startAt: z.string().min(1, WORK_SESSION_VALIDATION_KEY.required),
    endAt: z.string().min(1, WORK_SESSION_VALIDATION_KEY.required),
    note: optionalNoteSchema,
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startAt).getTime();
    const end = new Date(data.endAt).getTime();

    if (Number.isNaN(start)) {
      ctx.addIssue({
        code: "custom",
        path: ["startAt"],
        message: WORK_SESSION_VALIDATION_KEY.invalidRange,
      });
    }

    if (Number.isNaN(end)) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: WORK_SESSION_VALIDATION_KEY.invalidRange,
      });
    }

    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: WORK_SESSION_VALIDATION_KEY.invalidRange,
      });
    }
  });

export const ticketTrackDurationFormSchema = z.object({
  durationMinutes: z.coerce
    .number({ error: WORK_SESSION_VALIDATION_KEY.required })
    .int(WORK_SESSION_VALIDATION_KEY.positive)
    .positive(WORK_SESSION_VALIDATION_KEY.positive),
  note: optionalNoteSchema,
});
