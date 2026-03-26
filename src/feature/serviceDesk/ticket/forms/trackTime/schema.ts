import { z } from "zod";

export const ticketTrackRangeFormSchema = z
  .object({
    startAt: z.string().min(1, "Start time is required"),
    endAt: z.string().min(1, "End time is required"),
    note: z
      .string()
      .trim()
      .max(500, "Note must be less than 500 characters")
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startAt).getTime();
      const end = new Date(data.endAt).getTime();

      return !Number.isNaN(start) && !Number.isNaN(end) && end >= start;
    },
    {
      message: "End time must be after start time",
      path: ["endAt"],
    },
  );

const ticketTrackDurationMinutesSchema = z
  .preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === "string") {
      const parsedValue = Number(value);

      return Number.isNaN(parsedValue) ? value : parsedValue;
    }

    return value;
  }, z
    .number({
      error: "Duration must be a number",
    })
    .int("Duration must be an integer")
    .positive("Duration must be greater than 0")
    .optional())
  .refine((value) => value !== undefined, {
    message: "Duration must be a number",
  });

export const ticketTrackDurationFormSchema = z.object({
  durationMinutes: ticketTrackDurationMinutesSchema,
  note: z
    .string()
    .trim()
    .max(500, "Note must be less than 500 characters")
    .optional(),
});
