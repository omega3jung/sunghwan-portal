"use client";

import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { toast } from "@/components/ui/toast";
import { NS } from "@/lib/application/i18n";
import { adminAuth } from "@/mocks/domain/user";

import {
  getLoginErrorFeedback,
  LoginErrorCode,
  type LoginToastSeverity,
} from "../constants";
import type { LoginFormValues } from "../types";

type AuthenticationMode = "login" | "demo";

type UseAuthenticationOptions = {
  redirectHref: string;
  onCredentialsExpired: (username: string) => void;
};

export function useAuthentication({
  redirectHref,
  onCredentialsExpired,
}: UseAuthenticationOptions) {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation(NS.auth);
  const [pendingMode, setPendingMode] = useState<AuthenticationMode | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectHref);
    }
  }, [redirectHref, router, status]);

  const showLoginError = useCallback(
    (severity: LoginToastSeverity, description: string) => {
      toast.add({
        title: t("errors.title"),
        description,
        ...(severity === "default" ? {} : { type: severity }),
      });
    },
    [t],
  );

  const authenticate = useCallback(
    async (values: LoginFormValues, mode: AuthenticationMode) => {
      setErrorMessage(null);
      setPendingMode(mode);

      try {
        const result = await signIn("credentials", {
          username: values.username,
          password: values.password,
          mode,
          redirect: false,
        });

        if (!result?.ok) {
          throw new Error(result?.error ?? LoginErrorCode.Default);
        }
      } catch (error) {
        const { code, severity, textKey } = getLoginErrorFeedback(error);

        if (code === LoginErrorCode.ExpiredCredentials) {
          onCredentialsExpired(values.username);
          return;
        }

        const translatedMessage = t(textKey);
        setErrorMessage(translatedMessage);
        showLoginError(severity, translatedMessage);
      } finally {
        setPendingMode(null);
      }
    },
    [onCredentialsExpired, showLoginError, t],
  );

  const login = useCallback(
    (values: LoginFormValues) => authenticate(values, "login"),
    [authenticate],
  );

  const loginAsDemo = useCallback(
    () =>
      authenticate(
        {
          username: adminAuth.username,
          password: adminAuth.username,
        },
        "demo",
      ),
    [authenticate],
  );

  return {
    status,
    errorMessage,
    isLoginPending: pendingMode === "login",
    isDemoPending: pendingMode === "demo",
    clearError: () => setErrorMessage(null),
    login,
    loginAsDemo,
  };
}
