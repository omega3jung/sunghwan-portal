export enum LOGIN_ERROR_CODES {
  Default = "default",
  Match = "credentials-dont-match",
  Expired = "expired-credentials",
  CredentialsSignin = "internal-error",
}

type MessageSeverity =
  | "default"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "promise";

export const LOGIN_ERROR_MESSAGES: Record<
  LOGIN_ERROR_CODES,
  { severity: MessageSeverity; textKey: string }
> = {
  [LOGIN_ERROR_CODES.Default]: {
    severity: "default",
    textKey: "errors." + LOGIN_ERROR_CODES.Default,
  },
  [LOGIN_ERROR_CODES.Match]: {
    severity: "default",
    textKey: "errors." + LOGIN_ERROR_CODES.Match,
  },
  [LOGIN_ERROR_CODES.Expired]: {
    severity: "warning",
    textKey: "errors." + LOGIN_ERROR_CODES.Expired,
  },
  [LOGIN_ERROR_CODES.CredentialsSignin]: {
    severity: "default",
    textKey: "errors." + LOGIN_ERROR_CODES.CredentialsSignin,
  },
} as const;
