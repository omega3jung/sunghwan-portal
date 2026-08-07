"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useReducer } from "react";
import { useTranslation } from "react-i18next";

import { toast } from "@/components/ui/toast";
import { NS } from "@/lib/application/i18n";

import { authFlowReducer, INITIAL_AUTH_SCREEN } from "./authFlow";
import { CredentialsForm } from "./components/CredentialsForm";
import { LoginFooter } from "./components/LoginFooter";
import { PasswordRecoveryFlow } from "./components/PasswordRecoveryFlow";
import { SetPasswordForm } from "./components/SetPasswordForm";
import { useAuthentication } from "./hooks/useAuthentication";
import type { SetPasswordFormValues } from "./types";

type LoginScreenProps = {
  redirectHref: string;
};

const panelClassName =
  "flex w-full flex-col gap-5 rounded-lg border border-border/50 bg-foreground/10 p-4 shadow-sm xl:min-h-150 xl:w-140 xl:gap-9 xl:p-10 ";

export function LoginScreen({ redirectHref }: LoginScreenProps) {
  const { t } = useTranslation(NS.auth);
  const [screen, dispatch] = useReducer(authFlowReducer, INITIAL_AUTH_SCREEN);
  const handleCredentialsExpired = useCallback((username: string) => {
    dispatch({ type: "require-password-change", username });
  }, []);
  const authentication = useAuthentication({
    redirectHref,
    onCredentialsExpired: handleCredentialsExpired,
  });

  const openLogin = () => dispatch({ type: "open-login" });
  const openPasswordRecovery = () =>
    dispatch({ type: "open-password-recovery" });

  const updateExpiredPassword = (_values: SetPasswordFormValues) => {
    if (screen.kind !== "expired-credentials") {
      return;
    }

    toast.add({
      title: t("common.update.title", { ns: NS.message }),
      description: t("common.update.success", {
        ns: NS.message,
        item: t("field.password", { ns: NS.common }),
      }),
      type: "success",
    });
    openLogin();
  };

  if (authentication.status === "loading") {
    return (
      <div className={`${panelClassName} items-center justify-center`}>
        <Loader2 className="h-20 w-20 animate-spin text-background" />
      </div>
    );
  }

  return (
    <div className={panelClassName}>
      {screen.kind === "login" ? (
        <CredentialsForm
          onSubmit={authentication.login}
          onDemoLogin={authentication.loginAsDemo}
          isLoginPending={authentication.isLoginPending}
          isDemoPending={authentication.isDemoPending}
          errorMessage={authentication.errorMessage}
          onInputChange={authentication.clearError}
          onOpenPasswordRecovery={openPasswordRecovery}
        />
      ) : null}

      {screen.kind === "password-recovery" ? (
        <PasswordRecoveryFlow onBack={openLogin} onComplete={openLogin} />
      ) : null}

      {screen.kind === "expired-credentials" ? (
        <SetPasswordForm
          username={screen.username}
          reason="expired-credentials"
          onSubmit={updateExpiredPassword}
          onBack={openLogin}
        />
      ) : null}

      <LoginFooter />
    </div>
  );
}
