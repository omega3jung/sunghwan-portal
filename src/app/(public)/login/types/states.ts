export enum LoginView {
  Login = "login",
  ResetPassword = "reset-password",
  ChangePassword = "change-password",
}

export interface PasswordResetSession {
  username: string;
  resetToken: string | null;
}

export type ResetPasswordStep = "email" | "otp";
