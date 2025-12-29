export enum LoginStateEnum {
  LOGIN = "login",
  CHANGE = "change",
  RESET = "reset",
}

export interface ResetPasswordState {
  username: string;
  resetToken: string | null;
}
