import * as z from "zod";

/**
 * Login form validation schema
 * Used for user authentication (userid + password)
 */
export const loginFormSchema = z.object({
  userid: z.string().min(1, "common:actions.requiredField"),
  password: z.string().min(1, "common:actions.requiredField"),
});

export type LoginFormType = z.infer<typeof loginFormSchema>;

/**
 * OTP verification form schema
 * Used in "Forgot Password" flow before password reset
 */
export const verifyOTPFormSchema = z.object({
  userid: z.string().trim().min(1, "User ID is required"),
  email: z.email("Invalid email"),
  otp: z.string().length(6).regex(/^\d+$/),
});

export type VerifyOTPFormType = z.infer<typeof verifyOTPFormSchema>;

/**
 * OTP verification form schema
 * Used in "Forgot Password" flow before password reset
 */
export const changePasswordformSchema = z
  .object({
    userid: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export type ChangePasswordformType = z.infer<typeof changePasswordformSchema>;
