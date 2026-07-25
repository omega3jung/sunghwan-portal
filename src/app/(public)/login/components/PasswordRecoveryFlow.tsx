import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { NS } from "@/lib/application/i18n";

import {
  DEMO_OTP_CODE,
  DEMO_PASSWORD_RESET_TOKEN,
  OTP_DURATION_SECONDS,
} from "../constants";
import {
  recoveryIdentityFormSchema,
  type RecoveryIdentityFormValues,
  type SetPasswordFormValues,
  verifyOtpFormSchema,
  type VerifyOtpFormValues,
} from "../types";
import { AuthFormHeader } from "./AuthFormHeader";
import { SetPasswordForm } from "./SetPasswordForm";
import {
  authFieldLabelClassName,
  authInputClassName,
  authOutlineButtonClassName,
  authPrimaryButtonClassName,
  authSecondaryButtonClassName,
} from "./styles";

type PasswordRecoveryFlowProps = {
  onBack: VoidFunction;
  onComplete: VoidFunction;
};

type RecoveryState =
  | { step: "identify" }
  | {
      step: "verify-otp";
      username: string;
      email: string;
      expiresAt: number;
    }
  | {
      step: "set-password";
      username: string;
      resetToken: string;
    };

const createOtpExpiration = () => Date.now() + OTP_DURATION_SECONDS * 1000;

const formatRemainingTime = (remainingSeconds: number) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const useRemainingSeconds = (expiresAt: number) => {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    const calculateRemainingSeconds = () =>
      Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    const updateRemainingSeconds = (timer?: number) => {
      const nextRemainingSeconds = calculateRemainingSeconds();
      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds === 0 && timer != null) {
        window.clearInterval(timer);
      }
    };

    updateRemainingSeconds();
    const timer = window.setInterval(() => updateRemainingSeconds(timer), 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  return remainingSeconds;
};

export function PasswordRecoveryFlow({
  onBack,
  onComplete,
}: PasswordRecoveryFlowProps) {
  const { t } = useTranslation(NS.auth);
  const [state, setState] = useState<RecoveryState>({ step: "identify" });

  const sendOtp = (values: RecoveryIdentityFormValues) => {
    setState({
      step: "verify-otp",
      username: values.username,
      email: values.email,
      expiresAt: createOtpExpiration(),
    });
    showOtpSentToast(t, false);
  };

  const resendOtp = () => {
    if (state.step !== "verify-otp") {
      return;
    }

    setState({
      ...state,
      expiresAt: createOtpExpiration(),
    });
    showOtpSentToast(t, true);
  };

  const verifyOtp = (values: VerifyOtpFormValues) => {
    if (state.step !== "verify-otp") {
      return;
    }

    const hasExpired = Date.now() >= state.expiresAt;
    if (hasExpired || values.otp !== DEMO_OTP_CODE) {
      toast.add({
        title: t("validation:format.invalidWithField", {
          field: "OTP",
        }),
        type: "error",
      });
      return;
    }

    setState({
      step: "set-password",
      username: state.username,
      resetToken: DEMO_PASSWORD_RESET_TOKEN,
    });
  };

  const setPassword = (_values: SetPasswordFormValues) => {
    if (
      state.step !== "set-password" ||
      state.resetToken !== DEMO_PASSWORD_RESET_TOKEN
    ) {
      setState({ step: "identify" });
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
    onComplete();
  };

  if (state.step === "verify-otp") {
    return (
      <OtpVerificationForm
        state={state}
        onSubmit={verifyOtp}
        onResend={resendOtp}
        onBack={onBack}
      />
    );
  }

  if (state.step === "set-password") {
    return (
      <SetPasswordForm
        username={state.username}
        reason="password-reset"
        onSubmit={setPassword}
        onBack={onBack}
      />
    );
  }

  return <RecoveryIdentityForm onSubmit={sendOtp} onBack={onBack} />;
}

type RecoveryIdentityFormProps = {
  onSubmit: (values: RecoveryIdentityFormValues) => void | Promise<void>;
  onBack: VoidFunction;
};

function RecoveryIdentityForm({ onSubmit, onBack }: RecoveryIdentityFormProps) {
  const { t } = useTranslation(NS.auth);
  const form = useForm<RecoveryIdentityFormValues>({
    resolver: zodResolver(recoveryIdentityFormSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });
  const isPending = form.formState.isSubmitting;
  const usernameError = form.formState.errors.username?.message;
  const emailError = form.formState.errors.email?.message;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <AuthFormHeader
        title={t("resetPassword.title")}
        message={t("resetPassword.message")}
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <Field data-invalid={Boolean(usernameError)}>
          <FieldLabel
            htmlFor="reset-input-userid"
            className={authFieldLabelClassName}
          >
            {t("common.username")}
          </FieldLabel>
          <Input
            id="reset-input-userid"
            data-testid="reset-password-userid"
            disabled={isPending}
            aria-invalid={Boolean(usernameError)}
            placeholder={t("common.usernamePlaceholder")}
            autoComplete="username"
            className={authInputClassName}
            {...form.register("username")}
          />
          <FieldError>{usernameError ? t(usernameError) : null}</FieldError>
        </Field>
        <Field data-invalid={Boolean(emailError)}>
          <FieldLabel
            htmlFor="reset-input-email"
            className={authFieldLabelClassName}
          >
            {t("resetPassword.email")}
          </FieldLabel>
          <Input
            id="reset-input-email"
            data-testid="reset-password-email"
            disabled={isPending}
            aria-invalid={Boolean(emailError)}
            placeholder={t("resetPassword.emailPlaceholder")}
            type="email"
            autoComplete="email"
            className={authInputClassName}
            {...form.register("email")}
          />
          <FieldError>{emailError ? t(emailError) : null}</FieldError>
        </Field>
        <Button
          className={`mt-6 w-full ${authPrimaryButtonClassName}`}
          type="submit"
          disabled={isPending}
          data-testid="send-otp"
        >
          {t("resetPassword.otpSend")}
          {isPending ? <Loader2 className="ml-2 size-4 animate-spin" /> : null}
        </Button>
      </form>
      <BackButton onClick={onBack} disabled={isPending} />
    </div>
  );
}

type OtpVerificationFormProps = {
  state: Extract<RecoveryState, { step: "verify-otp" }>;
  onSubmit: (values: VerifyOtpFormValues) => void | Promise<void>;
  onResend: VoidFunction;
  onBack: VoidFunction;
};

function OtpVerificationForm({
  state,
  onSubmit,
  onResend,
  onBack,
}: OtpVerificationFormProps) {
  const { t } = useTranslation(NS.auth);
  const remainingSeconds = useRemainingSeconds(state.expiresAt);
  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpFormSchema),
    defaultValues: { otp: "" },
  });
  const isPending = form.formState.isSubmitting;
  const otpError = form.formState.errors.otp?.message;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <AuthFormHeader
        title={t("resetPassword.title")}
        message={t("resetPassword.message")}
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <Field>
          <FieldLabel
            htmlFor="reset-input-userid"
            className={authFieldLabelClassName}
          >
            {t("common.username")}
          </FieldLabel>
          <Input
            id="reset-input-userid"
            value={state.username}
            autoComplete="username"
            className={authInputClassName}
            readOnly
          />
        </Field>
        <Field>
          <FieldLabel
            htmlFor="reset-input-email"
            className={authFieldLabelClassName}
          >
            {t("resetPassword.email")}
          </FieldLabel>
          <Input
            id="reset-input-email"
            value={state.email}
            autoComplete="email"
            className={authInputClassName}
            readOnly
          />
        </Field>
        <Field data-invalid={Boolean(otpError)}>
          <FieldLabel
            htmlFor="reset-input-otp"
            className={authFieldLabelClassName}
          >
            OTP
          </FieldLabel>
          <Input
            id="reset-input-otp"
            data-testid="reset-password-otp"
            disabled={isPending}
            aria-invalid={Boolean(otpError)}
            placeholder={formatRemainingTime(remainingSeconds)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={DEMO_OTP_CODE.length}
            className={authInputClassName}
            {...form.register("otp")}
          />
          <FieldError>{otpError ? t(otpError) : null}</FieldError>
        </Field>

        <Button
          className={`mt-6 w-full ${authSecondaryButtonClassName}`}
          type="button"
          disabled={isPending}
          data-testid="send-otp"
          onClick={onResend}
        >
          {t("resetPassword.otpResend")}
        </Button>
        <Button
          className={`mt-2 w-full ${authPrimaryButtonClassName}`}
          type="submit"
          disabled={isPending || remainingSeconds <= 0}
          data-testid="reset-password-submit"
        >
          {t("common.submit")}
          {isPending ? <Loader2 className="ml-2 size-4 animate-spin" /> : null}
        </Button>
      </form>
      <BackButton onClick={onBack} disabled={isPending} />
    </div>
  );
}

type BackButtonProps = {
  onClick: VoidFunction;
  disabled: boolean;
};

function BackButton({ onClick, disabled }: BackButtonProps) {
  const { t } = useTranslation(NS.auth);

  return (
    <Button
      className={`mt-4 w-full ${authOutlineButtonClassName}`}
      type="button"
      variant="outline"
      disabled={disabled}
      data-testid="reset-open"
      onClick={onClick}
    >
      {t("common.goBack")}
    </Button>
  );
}

type Translation = ReturnType<typeof useTranslation>["t"];

function showOtpSentToast(t: Translation, isResend: boolean) {
  toast.add({
    title: isResend ? t("resetPassword.otpResend") : t("resetPassword.otpSend"),
    description: t("otp.sent", {
      ns: NS.message,
      code: DEMO_OTP_CODE,
      minutes: OTP_DURATION_SECONDS / 60,
    }),
    type: "info",
  });
}
