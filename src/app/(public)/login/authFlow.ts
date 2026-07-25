export type AuthScreen =
  | { kind: "login" }
  | { kind: "password-recovery" }
  | { kind: "expired-credentials"; username: string };

export type AuthFlowAction =
  | { type: "open-login" }
  | { type: "open-password-recovery" }
  | { type: "require-password-change"; username: string };

export const INITIAL_AUTH_SCREEN: AuthScreen = { kind: "login" };

export const authFlowReducer = (
  _state: AuthScreen,
  action: AuthFlowAction,
): AuthScreen => {
  switch (action.type) {
    case "open-login":
      return INITIAL_AUTH_SCREEN;
    case "open-password-recovery":
      return { kind: "password-recovery" };
    case "require-password-change":
      return {
        kind: "expired-credentials",
        username: action.username,
      };
  }
};
