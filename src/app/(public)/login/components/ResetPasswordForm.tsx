import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { verifyOTPFormSchema, VerifyOTPFormType } from "../types";

type Props = {
  isLoading: boolean;
  onSubmit: (values: VerifyOTPFormType) => Promise<void>;
  onBack: VoidFunction;
};

type Step = "email" | "otp";

export const ResetPasswordForm = (props: Props) => {
  const { t } = useTranslation("login");
  const { onSubmit, isLoading, onBack } = props;

  const [step, setStep] = useState<Step>("email");

  const [remainTime, setRemainTime] = useState<number | null>(null);

  const form = useForm<VerifyOTPFormType>({
    resolver: zodResolver(verifyOTPFormSchema),
    defaultValues: {
      username: "",
      email: "",
      otp: "",
    },
  });

  const onSendOTP = async () => {
    const isValid = await form.trigger(["username", "email"]);
    if (!isValid) return;

    // set remain time as 3 mins.
    setRemainTime(180);

    // TODO : send OTP.

    // check resend.
    const isResend = step === "otp";

    // mark as sent OTP request.
    if (step === "email") {
      setStep("otp");
    }

    toast(isResend ? t("otp.resent") : t("otp.sent"), {
      //description: "Input OTP in email within 3 mins.",
      description: "Input 123456 within 3 mins.",
    });
  };

  // display time limit.
  const timeLimit = useMemo(() => {
    if (remainTime === null || remainTime <= 0) {
      return t("otp.timeout");
    }

    const min = Math.floor(remainTime / 60);
    const sec = remainTime % 60;

    return `${min}:${sec.toString().padStart(2, "0")}`;
  }, [remainTime, t]);

  // update time limit.
  useEffect(() => {
    if (remainTime === null) return;
    if (remainTime <= 0) return;

    const timer = setInterval(() => {
      setRemainTime((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainTime]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <div className="pb-2">
        <p className="mb-1 text-center text-4xl font-normal leading-[48px]">
          {t("resetPasswordForm.title")}
        </p>
        <p className="text-center text-md leading-5 text-primary">
          {t("resetPasswordForm.message")}
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
                  disabled={isLoading || step === "otp"}
                  placeholder={t("common.usernamePlaceholder")}
                  required
                  {...form.register("username")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="reset-input-email">
                  {t("resetPasswordForm.email")}
                </FieldLabel>
                <Input
                  id="reset-input-email"
                  data-testid="reset-password-email"
                  disabled={isLoading || step === "otp"}
                  placeholder={t("resetPasswordForm.emailPlaceholder")}
                  required
                  {...form.register("email")}
                />
              </Field>
            </FieldGroup>
            <Field>
              <Button
                className="h-12 rounded-lg text-base font-normal md:w-full"
                type="button"
                disabled={isLoading}
                data-testid="send-otp"
                onClick={onSendOTP}
              >
                {step === "otp"
                  ? t("resetPasswordForm.otpResend")
                  : t("resetPasswordForm.otpSend")}
                {isLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
              </Button>
            </Field>
          </FieldSet>

          {step === "otp" && (
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="reset-input-otp">
                    {t("resetPasswordForm.otp")}
                  </FieldLabel>
                  <Input
                    id="reset-input-otp"
                    data-testid="reset-password-otp"
                    {...form.register("otp")}
                    placeholder={timeLimit}
                    maxLength={6}
                  />
                </Field>
              </FieldGroup>

              <Field>
                <Button
                  className="h-12 rounded-lg text-base font-normal md:w-full"
                  type="submit"
                  disabled={isLoading}
                  data-testid="reset-password-submit"
                >
                  {t("submit")}
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
        className="mt-6 h-12 rounded-lg text-base font-normal md:w-full"
        type="button"
        variant={"outline"}
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
