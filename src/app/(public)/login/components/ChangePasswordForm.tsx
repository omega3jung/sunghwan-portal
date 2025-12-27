import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ChangePasswordformType, changePasswordformSchema } from "../types";
import { LoginStateEnum } from "../types";

type Props = {
  isLoading: boolean;
  username: string;
  formType?: LoginStateEnum.CHANGE | LoginStateEnum.RESET;
  hideUserName?: boolean;
  onSubmit: (values: ChangePasswordformType) => Promise<void>;
  onBack: VoidFunction;
};

export const ChangePasswordForm = (props: Props) => {
  const { t } = useTranslation("login");
  const {
    isLoading,
    username,
    formType,
    hideUserName = false,
    onSubmit,
    onBack,
  } = props;

  const form = useForm<ChangePasswordformType>({
    resolver: zodResolver(changePasswordformSchema),
    defaultValues: {
      username: username ?? "",
      password: "",
      confirm: "",
    },
  });

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <div className="pb-2">
        <p className="mb-1 text-center text-4xl font-normal leading-[48px]">
          {formType === LoginStateEnum.CHANGE
            ? t("changePasswordForm.change.title")
            : t("changePasswordForm.reset.title")}
        </p>
        <p className="text-center text-lg leading-5 text-primary">
          {formType === LoginStateEnum.CHANGE
            ? t("changePasswordForm.change.message")
            : t("changePasswordForm.reset.message")}
        </p>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-2"
      >
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              {!hideUserName && (
                <Field>
                  <FieldLabel htmlFor="login-input-username">
                    {t("common.username")}
                  </FieldLabel>
                  <Input
                    id="change-input-username"
                    data-testid="change-password-username"
                    readOnly={true}
                    value={username}
                    {...form.register("username")}
                  />
                </Field>
              )}

              {formType === LoginStateEnum.CHANGE && (
                <Field>
                  <FieldLabel htmlFor="change-input-current-password">
                    {t("changePasswordForm.change.currentPassword")}
                  </FieldLabel>
                  <Input
                    id="change-input-current-password"
                    data-testid="change-current-password-password"
                    disabled={isLoading}
                    placeholder={t(
                      "changePasswordForm.change.currentPlaceholder"
                    )}
                    type="current"
                    required
                    {...form.register("current")}
                  />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="change-input-new-password">
                  {t("changePasswordForm.newPassword")}
                </FieldLabel>
                <Input
                  id="change-input-new-password"
                  data-testid="change-new-password-password"
                  disabled={isLoading}
                  placeholder={t("changePasswordForm.newPasswordPlaceholder")}
                  type="password"
                  required
                  {...form.register("password")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="change-input-confirm-password">
                  {t("changePasswordForm.confirmPassword")}
                </FieldLabel>
                <Input
                  id="change-input-confirm-password"
                  data-testid="change-confirm-password-password"
                  disabled={isLoading}
                  placeholder={t(
                    "changePasswordForm.confirmPlaceholder"
                  )}
                  type="password"
                  required
                  {...form.register("confirm")}
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <Field>
            <Button
              className="h-12 rounded-lg text-base md:w-full"
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
        className="mt-6 h-12 rounded-lg text-base font-normal md:w-full"
        type="button"
        variant={"outline"}
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
