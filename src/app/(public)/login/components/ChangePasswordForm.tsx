import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChangePasswordformType, changePasswordformSchema } from "../types";

type Props = {
  isLoading: boolean;
  username: string;
  hideUserName?: boolean;
  onSubmit: (values: ChangePasswordformType) => Promise<void>;
  onBack: VoidFunction;
};

export const ChangePasswordForm = (props: Props) => {
  const { t } = useTranslation("login");
  const { isLoading, username, hideUserName = false, onSubmit, onBack } = props;

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
      <div>
        <p className="mb-1 text-center text-4xl font-normal leading-[48px]">
          {t("managePasswordDialog.reset.title")}
        </p>
        <p className="text-center text-lg leading-5 text-primary">
          {t("signInMessage")}
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-2"
        >
          {!hideUserName && (
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-0 pb-4">
                  <FormLabel className="text-sm">User ID</FormLabel>
                  <FormControl>
                    <Input readOnly={true} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  {t("ChangePasswordForm.update.newPassword")}
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    disabled={isLoading}
                    placeholder="Enter new password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                {!form.formState.errors.password && (
                  <FormDescription className="text-right">
                    required
                  </FormDescription>
                )}

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  {t("ChangePasswordForm.update.confirmPassword")}
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="Enter confirm password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                {!form.formState.errors.confirm && (
                  <FormDescription className="text-right">
                    required
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="h-12 rounded-lg text-base md:w-full"
            type="submit"
            disabled={isLoading}
          >
            {t("common.submit")}
            {isLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
          </Button>
        </form>
      </Form>
      <Button
        className="mt-6 h-12 rounded-lg text-base font-normal md:w-full"
        type="button"
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
