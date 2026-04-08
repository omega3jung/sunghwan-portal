import * as z from "zod";

import { DEMO_OTP_CODE } from "../constants";

const VALIDATION_MESSAGES = {
  required: "validation:required.default",
  invalidFormat: "validation:format.invalid",
  minLength: "validation:length.min",
  passwordMismatch: "auth:changePassword.passwordDontMatch",
} as const;

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, VALIDATION_MESSAGES.required),
  password: z.string().min(1, VALIDATION_MESSAGES.required),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const verifyOtpFormSchema = z.object({
  username: z.string().trim().min(1, VALIDATION_MESSAGES.required),
  email: z.string().trim().email(VALIDATION_MESSAGES.invalidFormat),
  otp: z
    .string()
    .trim()
    .length(DEMO_OTP_CODE.length, VALIDATION_MESSAGES.invalidFormat)
    .regex(/^\d+$/, VALIDATION_MESSAGES.invalidFormat),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpFormSchema>;

export const changePasswordFormSchema = z
  .object({
    username: z.string().trim().min(1, VALIDATION_MESSAGES.required),
    current: z.string(),
    password: z.string().min(8, VALIDATION_MESSAGES.minLength),
    confirm: z.string().min(1, VALIDATION_MESSAGES.required),
  })
  .refine((data) => data.password === data.confirm, {
    message: VALIDATION_MESSAGES.passwordMismatch,
    path: ["confirm"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
