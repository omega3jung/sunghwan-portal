import { z } from "zod";

const optionalNoteSchema = z
  .string()
  .trim()
  .max(500, "Note must be less than 500 characters")
  .optional()
  .transform((value) => value ?? "");

export const ticketTrackRangeFormSchema = z
  .object({
    startAt: z.string().min(1, "Start time is required"),
    endAt: z.string().min(1, "End time is required"),
    note: optionalNoteSchema,
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startAt).getTime();
    const end = new Date(data.endAt).getTime();

    if (Number.isNaN(start)) {
      ctx.addIssue({
        code: "custom",
        path: ["startAt"],
        message: "Start time is invalid",
      });
    }

    if (Number.isNaN(end)) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "End time is invalid",
      });
    }

    if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "End time must be after start time",
      });
    }
  });

export const ticketTrackDurationFormSchema = z.object({
  durationMinutes: z.coerce
    .number({
      error: "Duration must be a number",
    })
    .int("Duration must be an integer")
    .positive("Duration must be greater than 0"),
  note: optionalNoteSchema,
});
