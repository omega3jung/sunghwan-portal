import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { PasswordInput } from "@/components/custom/PasswordInput";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NS } from "@/lib/application/i18n";

import { loginFormSchema, type LoginFormValues } from "../types";
import { AuthFormHeader } from "./AuthFormHeader";
import {
  authFieldLabelClassName,
  authInputClassName,
  authPrimaryButtonClassName,
  authSecondaryButtonClassName,
} from "./styles";

type CredentialsFormProps = {
  errorMessage?: string | null;
  isLoginPending: boolean;
  isDemoPending: boolean;
  onInputChange: VoidFunction;
  onOpenPasswordRecovery: VoidFunction;
  onSubmit: (values: LoginFormValues) => Promise<void>;
  onDemoLogin: () => Promise<void>;
};

export function CredentialsForm({
  errorMessage,
  isLoginPending,
  isDemoPending,
  onInputChange,
  onOpenPasswordRecovery,
  onSubmit,
  onDemoLogin,
}: CredentialsFormProps) {
  const { t } = useTranslation(NS.auth);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const isPending = isLoginPending || isDemoPending;
  const usernameError = form.formState.errors.username?.message;
  const passwordError = form.formState.errors.password?.message;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <AuthFormHeader
        title={t("login.title")}
        message={t("login.message")}
        variant="login"
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <Field data-invalid={Boolean(usernameError)}>
          <FieldLabel
            htmlFor="login-input-username"
            className={authFieldLabelClassName}
          >
            {t("common.username")}
          </FieldLabel>
          <Controller
            name="username"
            control={form.control}
            render={({ field }) => (
              <Input
                id="login-input-username"
                data-testid="login-username"
                disabled={isPending}
                aria-invalid={Boolean(usernameError)}
                className={authInputClassName}
                placeholder={t("common.usernamePlaceholder")}
                autoComplete="username"
                {...field}
                value={field.value ?? ""}
                onChange={(event) => {
                  field.onChange(event);
                  onInputChange();
                }}
                autoFocus
              />
            )}
          />
          <FieldError>{usernameError ? t(usernameError) : null}</FieldError>
        </Field>
        <Field data-invalid={Boolean(passwordError)}>
          <div className="flex items-center justify-between">
            <FieldLabel
              htmlFor="login-input-password"
              className={authFieldLabelClassName}
            >
              {t("common.password")}
            </FieldLabel>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-1 tracking-wide hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring/40"
              onClick={onOpenPasswordRecovery}
              tabIndex={-1}
            >
              {t("login.canNotLogin")}
            </Button>
          </div>
          <Controller
            name="password"
            control={form.control}
            render={({ field }) => (
              <PasswordInput
                id="login-input-password"
                disabled={isPending}
                aria-invalid={Boolean(passwordError)}
                className={authInputClassName}
                placeholder={t("common.passwordPlaceholder")}
                autoComplete="current-password"
                {...field}
                value={field.value ?? ""}
                onChange={(event) => {
                  field.onChange(event);
                  onInputChange();
                }}
              />
            )}
          />
          <FieldError>{passwordError ? t(passwordError) : null}</FieldError>
        </Field>
        <Button
          className={`mt-6 w-full ${authPrimaryButtonClassName}`}
          type="submit"
          disabled={isPending}
          data-testid="login-submit"
        >
          {isLoginPending ? (
            <>
              {t("loading.loggingIn")}
              <Loader2 className="ml-2 size-4 animate-spin" />
            </>
          ) : (
            t("login.logIn")
          )}
        </Button>
        {errorMessage ? (
          <p
            role="alert"
            className="text-center text-sm font-medium text-destructive"
          >
            {errorMessage}
          </p>
        ) : null}
      </form>

      <Button
        className={`mt-4 w-full ${authSecondaryButtonClassName}`}
        type="button"
        variant="secondary"
        data-testid="try-demo-login"
        onClick={onDemoLogin}
        disabled={isPending}
      >
        {isDemoPending ? (
          <>
            {t("loading.loggingIn")}
            <Loader2 className="ml-2 size-4 animate-spin" />
          </>
        ) : (
          t("login.tryDemo")
        )}
      </Button>
    </div>
  );
}
