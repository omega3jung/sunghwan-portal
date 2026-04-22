import { z } from "zod";

import i18n, { NS } from "@/lib/i18n";

const tCommonField = (field: string) => i18n.t(`field.${field}`, { ns: NS.common });
const tValidation = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key, { ns: NS.validation, ...(options ?? {}) });

const optionalNoteSchema = z
  .string()
  .trim()
  .max(
    500,
    tValidation("length.maxWithField", {
      field: tCommonField("note"),
      count: 500,
    }),
  )
  .optional()
  .transform((value) => value ?? "");

export const ticketTrackRangeFormSchema = z
  .object({
    startAt: z.string().min(
      1,
      tValidation("required.withField", {
        field: tCommonField("startTime"),
      }),
    ),
    endAt: z.string().min(
      1,
      tValidation("required.withField", {
        field: tCommonField("endTime"),
      }),
    ),
    note: optionalNoteSchema,
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startAt).getTime();
    const end = new Date(data.endAt).getTime();

    if (Number.isNaN(start)) {
      ctx.addIssue({
        code: "custom",
        path: ["startAt"],
        message: tValidation("date.invalidWithField", {
          field: tCommonField("startTime"),
        }),
      });
    }

    if (Number.isNaN(end)) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: tValidation("date.invalidWithField", {
          field: tCommonField("endTime"),
        }),
      });
    }

    if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: tValidation("date.afterWithField", {
          field: tCommonField("endTime"),
          target: tCommonField("startTime"),
        }),
      });
    }
  });

export const ticketTrackDurationFormSchema = z.object({
  durationMinutes: z.coerce
    .number({
      error: tValidation("number.invalidWithField", {
        field: tCommonField("duration"),
      }),
    })
    .int(
      tValidation("number.integerWithField", {
        field: tCommonField("duration"),
      }),
    )
    .positive(
      tValidation("number.positiveWithField", {
        field: tCommonField("duration"),
      }),
    ),
  note: optionalNoteSchema,
});
