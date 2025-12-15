export enum LoginStateEnum {
  LOGIN = "login",
  CHANGE = "change",
  RESET = "reset",
}

export interface ResetPasswordState {
  userId: string;
  resetToken: string | null;
}
