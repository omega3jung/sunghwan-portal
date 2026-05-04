export enum LoginErrorCode {
  Default = "default",
  CredentialsDontMatch = "credentials-dont-match",
  ExpiredCredentials = "expired-credentials",
  InternalError = "internal-error",
}

export type LoginToastSeverity = "default" | "warning" | "error";

type LoginErrorFeedback = {
  severity: LoginToastSeverity;
  textKey: string;
};

const LOGIN_ERROR_FEEDBACK: Record<LoginErrorCode, LoginErrorFeedback> = {
  [LoginErrorCode.Default]: {
    severity: "default",
    textKey: `errors.${LoginErrorCode.Default}`,
  },
  [LoginErrorCode.CredentialsDontMatch]: {
    severity: "default",
    textKey: `errors.${LoginErrorCode.CredentialsDontMatch}`,
  },
  [LoginErrorCode.ExpiredCredentials]: {
    severity: "warning",
    textKey: `errors.${LoginErrorCode.ExpiredCredentials}`,
  },
  [LoginErrorCode.InternalError]: {
    severity: "default",
    textKey: `errors.${LoginErrorCode.InternalError}`,
  },
};

export const getLoginErrorCode = (error: unknown): LoginErrorCode => {
  if (!(error instanceof Error)) {
    return LoginErrorCode.Default;
  }

  const errorCode = error.message as LoginErrorCode;

  return errorCode in LOGIN_ERROR_FEEDBACK ? errorCode : LoginErrorCode.Default;
};

export const getLoginErrorFeedback = (error: unknown) => {
  const code = getLoginErrorCode(error);

  return {
    code,
    ...LOGIN_ERROR_FEEDBACK[code],
  };
};
