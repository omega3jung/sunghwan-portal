"use client";

import { Globe, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { adminAuth } from "@/app/_mocks/domain/user";
import { ComboBox } from "@/components/custom/ComboBox";
import { Button } from "@/components/ui/button";
import { createDefaultPreference } from "@/domain/user/preference";
import {
  useCreateUserPreference,
  useUpdateUserPreference,
  useUserPreferenceQuery,
} from "@/feature/user/preference";
import { useLanguageState } from "@/hooks/useLanguage";
import { NS } from "@/lib/i18n";
import { languageOptions } from "@/shared/constants/options/language";
import { isLocale } from "@/shared/utils";

import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { LoginForm } from "./components/LoginForm";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import {
  DEMO_OTP_CODE,
  getLoginErrorFeedback,
  LoginErrorCode,
  LoginToastSeverity,
} from "./constants";
import {
  ChangePasswordFormValues,
  LoginFormValues,
  LoginView,
  PasswordResetSession,
  VerifyOtpFormValues,
} from "./types";

type LoginPageClientProps = {
  redirectHref: string;
};

const panelClassName =
  "flex w-full flex-col gap-5 rounded-lg bg-foreground/10 p-4 xl:min-h-[44rem] xl:w-[40rem] xl:gap-9 xl:px-10 xl:pb-8 xl:pt-12";

const footerLinkClassName = "py-0 text-base font-normal";

export function LoginPageClient({ redirectHref }: LoginPageClientProps) {
  const router = useRouter();
  const { status } = useSession();
  const { data: userPreference } = useUserPreferenceQuery(null);
  const { mutate: createUserPreference } = useCreateUserPreference();
  const { mutate: updateUserPreference } = useUpdateUserPreference();
  const { t } = useTranslation(NS.auth);
  const { language, changeLanguage } = useLanguageState();

  const [hasSignedIn, setHasSignedIn] = useState(false);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);
  const [view, setView] = useState<LoginView>(LoginView.Login);
  const [passwordResetSession, setPasswordResetSession] =
    useState<PasswordResetSession | null>(null);
  const passwordChangeMode =
    passwordResetSession?.resetToken != null
      ? LoginView.ResetPassword
      : LoginView.ChangePassword;

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (userPreference?.language && userPreference.language !== language) {
      changeLanguage(userPreference.language);
    }
  }, [changeLanguage, language, userPreference?.language]);

  useEffect(() => {
    if (hasSignedIn && status === "authenticated") {
      router.replace(redirectHref);
    }
  }, [hasSignedIn, redirectHref, router, status]);

  const openLoginView = () => {
    setPasswordResetSession(null);
    setView(LoginView.Login);
  };

  const openResetPasswordView = () => {
    setPasswordResetSession(null);
    setView(LoginView.ResetPassword);
  };

  const openChangePasswordView = (
    username: string,
    resetToken: string | null = null,
  ) => {
    setPasswordResetSession({ username, resetToken });
    setView(LoginView.ChangePassword);
  };

  const showToastBySeverity = (
    severity: LoginToastSeverity,
    description: string,
  ) => {
    switch (severity) {
      case "warning":
        toast.warning(t("errors.title"), { description });
        return;
      case "error":
        toast.error(t("errors.title"), { description });
        return;
      default:
        toast(t("errors.title"), { description });
    }
  };

  const handleLoginError = (error: unknown, username: string) => {
    const { code, severity, textKey } = getLoginErrorFeedback(error);

    if (code === LoginErrorCode.ExpiredCredentials) {
      openChangePasswordView(username);
      return;
    }

    showToastBySeverity(severity, t(textKey));
  };

  const authenticate = async (
    values: LoginFormValues,
    mode: "login" | "demo",
  ) => {
    if (mode === "login") {
      setIsLoginSubmitting(true);
    } else {
      setIsDemoSubmitting(true);
    }

    try {
      const result = await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error(result?.error ?? LoginErrorCode.Default);
      }

      setHasSignedIn(true);
    } catch (error) {
      setHasSignedIn(false);
      handleLoginError(error, values.username);
    } finally {
      if (mode === "login") {
        setIsLoginSubmitting(false);
      } else {
        setIsDemoSubmitting(false);
      }
    }
  };

  const handleLoginSubmit = async (values: LoginFormValues) => {
    await authenticate(values, "login");
  };

  const handleDemoLogin = async () => {
    await authenticate(
      { username: adminAuth.id, password: adminAuth.id },
      "demo",
    );
  };

  const handleVerifyOtp = async ({ username, otp }: VerifyOtpFormValues) => {
    if (otp !== DEMO_OTP_CODE) {
      toast.error(
        t("validation:format.invalidWithField", {
          field: "OTP",
        }),
      );
      return;
    }

    openChangePasswordView(username, "true");
  };

  const handleChangePassword = async ({
    username,
  }: ChangePasswordFormValues) => {
    if (username !== passwordResetSession?.username) {
      toast.error(t("common.validation.errorTitle", { ns: NS.message }), {
        description: t("common.opt.differentId", { ns: NS.message }),
      });
      setPasswordResetSession(null);
      openResetPasswordView();
      return;
    }

    toast.success(t("common.update.title", { ns: NS.message }), {
      description: t("common.update.success", {
        ns: NS.message,
        item: t("field.password", { ns: NS.common }),
      }),
    });

    openLoginView();
  };

  const handleLanguageChange = (nextLanguage: string) => {
    if (!isLocale(nextLanguage)) {
      return;
    }

    changeLanguage(nextLanguage);

    const payload = {
      ...(userPreference ?? createDefaultPreference()),
      language: nextLanguage,
    };

    if (userPreference) {
      updateUserPreference({ userId: null, data: payload });
      return;
    }

    createUserPreference({ userId: null, data: payload });
  };

  if (status === "loading") {
    return (
      <div className={`${panelClassName} items-center justify-center`}>
        <Loader2 className="h-20 w-20 animate-spin text-background" />
      </div>
    );
  }

  return (
    <div className={panelClassName}>
      {view === LoginView.Login && (
        <div>
          <LoginForm
            onSubmit={handleLoginSubmit}
            isLoading={isLoginSubmitting}
          />
          <Button
            className="mt-6 h-12 w-full rounded-lg text-base font-normal"
            type="button"
            variant="secondary"
            data-testid="forgot-open"
            onClick={handleDemoLogin}
          >
            {isDemoSubmitting ? (
              <>
                {t("loading.loggingIn")}
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              </>
            ) : (
              t("login.tryDemo")
            )}
          </Button>
        </div>
      )}

      {view === LoginView.ResetPassword && (
        <ResetPasswordForm
          isLoading={false}
          onSubmit={handleVerifyOtp}
          onBack={openLoginView}
        />
      )}

      {view === LoginView.ChangePassword && (
        <ChangePasswordForm
          isLoading={false}
          username={passwordResetSession?.username ?? ""}
          mode={passwordChangeMode}
          onSubmit={handleChangePassword}
          onBack={openLoginView}
        />
      )}

      <div className="flex flex-col justify-center border-t-[1px] border-primary/20 pt-6 text-center">
        <p>
          <Button
            variant="link"
            className="py-0 text-base font-semibold uppercase"
            onClick={openResetPasswordView}
          >
            {t("login.canNotLogin")}
          </Button>
        </p>

        <p>
          <Button variant="link" className={footerLinkClassName}>
            {t("login.helpCenter")}
          </Button>
          <span className="px-1" aria-hidden="true">
            &middot;
          </span>
          <Button
            variant="link"
            className={`${footerLinkClassName} text-primary`}
          >
            {t("login.privacyAndTerms")}
          </Button>
        </p>

        <p>
          <ComboBox
            id="language-picker"
            className="mt-2 w-48"
            placeholder="Language Picker"
            variant="icon"
            options={languageOptions}
            onChange={handleLanguageChange}
            icon={<Globe />}
            value={language ?? "en"}
          />
        </p>
      </div>
    </div>
  );
}
