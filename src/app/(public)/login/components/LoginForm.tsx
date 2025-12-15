import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginFormType, loginFormSchema } from "../types";

type Props = {
  isLoading: boolean;
  onSubmit: (values: LoginFormType) => Promise<void>;
  onForgotPassword: VoidFunction;
};

export const LoginForm = (props: Props) => {
  const { t } = useTranslation("login");
  const { isLoading, onSubmit, onForgotPassword } = props;

  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      userid: "",
      password: "",
    },
  });

  return (
    <div className="relative flex w-full justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-2"
        >
          <FormField
            control={form.control}
            name="userid"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">
                  {t("loginForm.username")}
                </FormLabel>
                <FormControl>
                  <Input
                    data-testid="login-username"
                    disabled={isLoading}
                    className="h-12 rounded-lg border border-primary bg-portal-accent placeholder:text-white lg:w-full"
                    placeholder={t("loginForm.usernamePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">
                  {t("loginForm.password")}
                </FormLabel>
                <FormControl>
                  <Input
                    data-testid="login-password"
                    disabled={isLoading}
                    className="h-12 rounded-lg border border-primary bg-portal-accent placeholder:text-white lg:w-full"
                    placeholder={t("loginForm.passwordPlaceholder")}
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="mt-6 h-12 rounded-lg text-base font-normal md:w-full"
            type="submit"
            disabled={isLoading}
            data-testid="login-submit"
          >
            {t("loginForm.logIn")}
            {isLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
          </Button>
        </form>
      </Form>

      <Button
        className="mt-6 h-12 rounded-lg text-base font-normal md:w-full"
        type="button"
        disabled={isLoading}
        data-testid="forgot-open"
        onClick={onForgotPassword}
      >
        {t("loginForm.forgotPassword")}
        {isLoading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
      </Button>
    </div>
  );
};
