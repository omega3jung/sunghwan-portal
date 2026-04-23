import { z } from "zod";

import { TICKET_TRACK_TIME_NOTE_MAX_LENGTH } from "../constants";

export const TRACK_TIME_VALIDATION_KEY = {
  required: "validation.trackTime.required",
  positive: "validation.trackTime.positive",
  invalidRange: "validation.trackTime.invalidRange",
  noteMaxLength: "validation.trackTime.noteMaxLength",
} as const;

const optionalNoteSchema = z
  .string()
  .trim()
  .max(
    TICKET_TRACK_TIME_NOTE_MAX_LENGTH,
    TRACK_TIME_VALIDATION_KEY.noteMaxLength,
  )
  .optional()
  .transform((value) => value ?? "");

export const ticketTrackRangeFormSchema = z
  .object({
    startAt: z.string().min(1, TRACK_TIME_VALIDATION_KEY.required),
    endAt: z.string().min(1, TRACK_TIME_VALIDATION_KEY.required),
    note: optionalNoteSchema,
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startAt).getTime();
    const end = new Date(data.endAt).getTime();

    if (Number.isNaN(start)) {
      ctx.addIssue({
        code: "custom",
        path: ["startAt"],
        message: TRACK_TIME_VALIDATION_KEY.invalidRange,
      });
    }

    if (Number.isNaN(end)) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: TRACK_TIME_VALIDATION_KEY.invalidRange,
      });
    }

    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: TRACK_TIME_VALIDATION_KEY.invalidRange,
      });
    }
  });

export const ticketTrackDurationFormSchema = z.object({
  durationMinutes: z.coerce
    .number({ error: TRACK_TIME_VALIDATION_KEY.required })
    .int(TRACK_TIME_VALIDATION_KEY.positive)
    .positive(TRACK_TIME_VALIDATION_KEY.positive),
  note: optionalNoteSchema,
});
