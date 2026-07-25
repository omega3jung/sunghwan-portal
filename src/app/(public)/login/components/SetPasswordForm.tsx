import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NS } from "@/lib/application/i18n";

import {
  createSetPasswordFormSchema,
  type PasswordChangeReason,
  type SetPasswordFormValues,
} from "../types";
import { AuthFormHeader } from "./AuthFormHeader";
import {
  authFieldLabelClassName,
  authInputClassName,
  authOutlineButtonClassName,
  authPrimaryButtonClassName,
} from "./styles";

type SetPasswordFormProps = {
  username: string;
  reason: PasswordChangeReason;
  onSubmit: (values: SetPasswordFormValues) => void | Promise<void>;
  onBack: VoidFunction;
};

export function SetPasswordForm({
  username,
  reason,
  onSubmit,
  onBack,
}: SetPasswordFormProps) {
  const { t } = useTranslation(NS.auth);
  const schema = useMemo(() => createSetPasswordFormSchema(reason), [reason]);
  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirm: "",
      current: "",
    },
  });

  useEffect(() => {
    form.reset({
      password: "",
      confirm: "",
      current: "",
    });
  }, [form, reason, username]);

  const isExpiredCredentials = reason === "expired-credentials";
  const isPending = form.formState.isSubmitting;
  const currentError = form.formState.errors.current?.message;
  const passwordError = form.formState.errors.password?.message;
  const confirmError = form.formState.errors.confirm?.message;
  const translateError = (message?: string) =>
    message ? t(message, { count: 8 }) : null;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <AuthFormHeader
        title={
          isExpiredCredentials
            ? t("changePassword.change.title")
            : t("changePassword.reset.title")
        }
        message={
          isExpiredCredentials
            ? t("changePassword.change.message")
            : t("changePassword.reset.message")
        }
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <Field>
          <FieldLabel
            htmlFor="change-input-username"
            className={authFieldLabelClassName}
          >
            {t("common.username")}
          </FieldLabel>
          <Input
            id="change-input-username"
            data-testid="change-password-username"
            value={username}
            autoComplete="username"
            className={authInputClassName}
            readOnly
          />
        </Field>

        {isExpiredCredentials ? (
          <Field data-invalid={Boolean(currentError)}>
            <FieldLabel
              htmlFor="change-input-current-password"
              className={authFieldLabelClassName}
            >
              {t("changePassword.change.currentPassword")}
            </FieldLabel>
            <Input
              id="change-input-current-password"
              data-testid="change-current-password-password"
              disabled={isPending}
              aria-invalid={Boolean(currentError)}
              placeholder={t("changePassword.change.currentPlaceholder")}
              type="password"
              autoComplete="current-password"
              className={authInputClassName}
              {...form.register("current")}
            />
            <FieldError>{translateError(currentError)}</FieldError>
          </Field>
        ) : null}

        <Field data-invalid={Boolean(passwordError)}>
          <FieldLabel
            htmlFor="change-input-new-password"
            className={authFieldLabelClassName}
          >
            {t("changePassword.newPassword")}
          </FieldLabel>
          <Input
            id="change-input-new-password"
            data-testid="change-new-password-password"
            disabled={isPending}
            aria-invalid={Boolean(passwordError)}
            placeholder={t("changePassword.newPasswordPlaceholder")}
            type="password"
            autoComplete="new-password"
            className={authInputClassName}
            {...form.register("password")}
          />
          <FieldError>{translateError(passwordError)}</FieldError>
        </Field>

        <Field data-invalid={Boolean(confirmError)}>
          <FieldLabel
            htmlFor="change-input-confirm-password"
            className={authFieldLabelClassName}
          >
            {t("changePassword.confirmPassword")}
          </FieldLabel>
          <Input
            id="change-input-confirm-password"
            data-testid="change-confirm-password-password"
            disabled={isPending}
            aria-invalid={Boolean(confirmError)}
            placeholder={t("changePassword.confirmPlaceholder")}
            type="password"
            autoComplete="new-password"
            className={authInputClassName}
            {...form.register("confirm")}
          />
          <FieldError>{translateError(confirmError)}</FieldError>
        </Field>

        <Button
          className={`mt-6 w-full ${authPrimaryButtonClassName}`}
          type="submit"
          disabled={isPending}
        >
          {t("common.submit")}
          {isPending ? (
            <Loader2 className="ml-2 size-4 animate-spin" />
          ) : null}
        </Button>
      </form>
      <Button
        className={`mt-4 w-full ${authOutlineButtonClassName}`}
        type="button"
        variant="outline"
        disabled={isPending}
        data-testid="forgot-open"
        onClick={onBack}
      >
        {t("common.goBack")}
      </Button>
    </div>
  );
}
