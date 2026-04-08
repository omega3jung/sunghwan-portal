import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { loginFormSchema, LoginFormValues } from "../types";

type LoginFormProps = {
  isLoading: boolean;
  onSubmit: (values: LoginFormValues) => Promise<void>;
};

export const LoginForm = ({ isLoading, onSubmit }: LoginFormProps) => {
  const { t } = useTranslation("login");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <div className="pb-2">
        <p className="text-center text-2xl font-normal leading-[48px] md:text-4xl">
          {t("loginForm.title")}
        </p>
        <p className="text-center leading-5 md:text-lg">
          {t("loginForm.message")}
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
                <FieldLabel htmlFor="login-input-username">
                  {t("common.username")}
                </FieldLabel>
                <Input
                  id="login-input-username"
                  data-testid="login-username"
                  disabled={isLoading}
                  className="h-12 w-full rounded-lg border border-primary bg-portal-accent placeholder:text-white"
                  placeholder={t("common.usernamePlaceholder")}
                  required
                  {...form.register("username")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="login-input-password">
                  {t("common.password")}
                </FieldLabel>
                <Input
                  id="login-input-password"
                  disabled={isLoading}
                  className="h-12 w-full rounded-lg border border-primary bg-portal-accent placeholder:text-white"
                  placeholder={t("common.passwordPlaceholder")}
                  type="password"
                  required
                  {...form.register("password")}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field>
            <Button
              className="mt-6 h-12 w-full rounded-lg text-base font-normal"
              type="submit"
              disabled={isLoading}
              data-testid="login-submit"
            >
              {isLoading ? (
                <>
                  {t("loading.loggingIn")}
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                </>
              ) : (
                t("loginForm.logIn")
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
};
