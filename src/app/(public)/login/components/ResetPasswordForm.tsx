import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NS } from "@/lib/i18n";

import { DEMO_OTP_CODE, OTP_DURATION_SECONDS } from "../constants";
import {
  ResetPasswordStep,
  verifyOtpFormSchema,
  VerifyOtpFormValues,
} from "../types";

type ResetPasswordFormProps = {
  isLoading: boolean;
  onSubmit: (values: VerifyOtpFormValues) => Promise<void>;
  onBack: VoidFunction;
};

const formatRemainingTime = (
  remainingSeconds: number | null,
  timeoutLabel: string,
) => {
  if (remainingSeconds === null || remainingSeconds <= 0) {
    return timeoutLabel;
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const ResetPasswordForm = ({
  onSubmit,
  isLoading,
  onBack,
}: ResetPasswordFormProps) => {
  const { t } = useTranslation(NS.auth);
  const [step, setStep] = useState<ResetPasswordStep>("email");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpFormSchema),
    defaultValues: {
      username: "",
      email: "",
      otp: "",
    },
  });

  const isOtpStep = step === "otp";
  const otpPlaceholder = useMemo(
    () => formatRemainingTime(remainingSeconds, "0:00"),
    [remainingSeconds],
  );

  const handleSendOtp = async () => {
    const isValid = await form.trigger(["username", "email"]);

    if (!isValid) {
      return;
    }

    setRemainingSeconds(OTP_DURATION_SECONDS);
    setStep("otp");

    toast(
      isOtpStep ? t("resetPassword.otpResend") : t("resetPassword.otpSend"),
      {
        description: t("otp.sent", {
          ns: NS.message,
          code: DEMO_OTP_CODE,
          minutes: 3,
        }),
      },
    );
  };

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRemainingSeconds((current) => {
        if (!current || current <= 1) {
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [remainingSeconds]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <div className="pb-2">
        <p className="mb-1 text-center text-4xl font-normal leading-[48px]">
          {t("resetPassword.title")}
        </p>
        <p className="text-center text-md leading-5 text-primary">
          {t("resetPassword.message")}
        </p>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-6"
      >
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reset-input-userid">
                  {t("common.username")}
                </FieldLabel>
                <Input
                  id="reset-input-userid"
                  data-testid="reset-password-userid"
                  disabled={isLoading || isOtpStep}
                  placeholder={t("common.usernamePlaceholder")}
                  required
                  {...form.register("username")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="reset-input-email">
                  {t("resetPassword.email")}
                </FieldLabel>
                <Input
                  id="reset-input-email"
                  data-testid="reset-password-email"
                  disabled={isLoading || isOtpStep}
                  placeholder={t("resetPassword.emailPlaceholder")}
                  type="email"
                  required
                  {...form.register("email")}
                />
              </Field>
            </FieldGroup>
            <Field>
              <Button
                className="h-12 text-base font-normal md:w-full"
                type="button"
                disabled={isLoading}
                data-testid="send-otp"
                onClick={handleSendOtp}
              >
                {isOtpStep
                  ? t("resetPassword.otpResend")
                  : t("resetPassword.otpSend")}
                {isLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
              </Button>
            </Field>
          </FieldSet>

          {isOtpStep && (
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="reset-input-otp">OTP</FieldLabel>
                  <Input
                    id="reset-input-otp"
                    data-testid="reset-password-otp"
                    {...form.register("otp")}
                    placeholder={otpPlaceholder}
                    maxLength={DEMO_OTP_CODE.length}
                  />
                </Field>
              </FieldGroup>

              <Field>
                <Button
                  className="h-12 text-base font-normal md:w-full"
                  type="submit"
                  disabled={isLoading}
                  data-testid="reset-password-submit"
                >
                  {t("common.submit")}
                  {isLoading && (
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  )}
                </Button>
              </Field>
            </FieldSet>
          )}
        </FieldGroup>
      </form>

      <Button
        className="mt-6 h-12 text-base font-normal md:w-full"
        type="button"
        variant="outline"
        disabled={isLoading}
        data-testid="reset-open"
        onClick={onBack}
      >
        {t("common.goBack")}
        {isLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
      </Button>
    </div>
  );
};
