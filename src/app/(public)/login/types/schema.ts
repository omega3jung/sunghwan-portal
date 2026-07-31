import * as z from "zod";

import { DEMO_OTP_CODE } from "../constants";
import type { PasswordChangeReason } from "./states";

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

export const recoveryIdentityFormSchema = z.object({
  username: z.string().trim().min(1, VALIDATION_MESSAGES.required),
  email: z.string().trim().email(VALIDATION_MESSAGES.invalidFormat),
});

export type RecoveryIdentityFormValues = z.infer<
  typeof recoveryIdentityFormSchema
>;

export const verifyOtpFormSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(DEMO_OTP_CODE.length, VALIDATION_MESSAGES.invalidFormat)
    .regex(/^\d+$/, VALIDATION_MESSAGES.invalidFormat),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpFormSchema>;

const setPasswordFormSchema = z
  .object({
    current: z.string(),
    password: z.string().min(8, VALIDATION_MESSAGES.minLength),
    confirm: z.string().min(1, VALIDATION_MESSAGES.required),
  })
  .refine((data) => data.password === data.confirm, {
    message: VALIDATION_MESSAGES.passwordMismatch,
    path: ["confirm"],
  });

export const createSetPasswordFormSchema = (reason: PasswordChangeReason) =>
  setPasswordFormSchema.superRefine((data, context) => {
    if (
      reason === "expired-credentials" &&
      data.current.trim().length === 0
    ) {
      context.addIssue({
        code: "custom",
        message: VALIDATION_MESSAGES.required,
        path: ["current"],
      });
    }
  });

export type SetPasswordFormValues = z.infer<typeof setPasswordFormSchema>;
