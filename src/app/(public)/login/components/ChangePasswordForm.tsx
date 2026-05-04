import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NS } from "@/lib/i18n";

import {
  changePasswordFormSchema,
  ChangePasswordFormValues,
  LoginView,
} from "../types";

type ChangePasswordFormProps = {
  isLoading: boolean;
  username: string;
  mode: LoginView.ChangePassword | LoginView.ResetPassword;
  onSubmit: (values: ChangePasswordFormValues) => Promise<void>;
  onBack: VoidFunction;
};

export const ChangePasswordForm = ({
  isLoading,
  username,
  mode,
  onSubmit,
  onBack,
}: ChangePasswordFormProps) => {
  const { t } = useTranslation(NS.auth);
  const isChangeMode = mode === LoginView.ChangePassword;

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      username,
      password: "",
      confirm: "",
      current: "",
    },
  });

  useEffect(() => {
    form.reset({
      username,
      password: "",
      confirm: "",
      current: "",
    });
  }, [form, mode, username]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <div className="pb-2">
        <p className="mb-1 text-center text-4xl font-normal leading-[48px]">
          {isChangeMode
            ? t("changePassword.change.title")
            : t("changePassword.reset.title")}
        </p>
        <p className="text-center text-lg leading-5 text-primary">
          {isChangeMode
            ? t("changePassword.change.message")
            : t("changePassword.reset.message")}
        </p>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-2"
      >
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="change-input-username">
                  {t("common.username")}
                </FieldLabel>
                <Input
                  id="change-input-username"
                  data-testid="change-password-username"
                  readOnly
                  {...form.register("username")}
                />
              </Field>

              {isChangeMode && (
                <Field>
                  <FieldLabel htmlFor="change-input-current-password">
                    {t("changePassword.change.currentPassword")}
                  </FieldLabel>
                  <Input
                    id="change-input-current-password"
                    data-testid="change-current-password-password"
                    disabled={isLoading}
                    placeholder={t("changePassword.change.currentPlaceholder")}
                    type="password"
                    required
                    {...form.register("current")}
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="change-input-new-password">
                  {t("changePassword.newPassword")}
                </FieldLabel>
                <Input
                  id="change-input-new-password"
                  data-testid="change-new-password-password"
                  disabled={isLoading}
                  placeholder={t("changePassword.newPasswordPlaceholder")}
                  type="password"
                  required
                  {...form.register("password")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="change-input-confirm-password">
                  {t("changePassword.confirmPassword")}
                </FieldLabel>
                <Input
                  id="change-input-confirm-password"
                  data-testid="change-confirm-password-password"
                  disabled={isLoading}
                  placeholder={t("changePassword.confirmPlaceholder")}
                  type="password"
                  required
                  {...form.register("confirm")}
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <Field>
            <Button
              className="h-12 text-base md:w-full"
              type="submit"
              disabled={isLoading}
            >
              {t("common.submit")}
              {isLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <Button
        className="mt-6 h-12 text-base font-normal md:w-full"
        type="button"
        variant="outline"
        disabled={isLoading}
        data-testid="forgot-open"
        onClick={onBack}
      >
        {t("common.goBack")}
        {isLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
      </Button>
    </div>
  );
};
