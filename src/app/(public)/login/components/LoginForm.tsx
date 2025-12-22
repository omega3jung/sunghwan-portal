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
import i18n from "@/lib/i18n";

type Props = {
  isLoading: boolean;
  onSubmit: (values: LoginFormType) => Promise<void>;
};

export const LoginForm = (props: Props) => {
  const { t } = useTranslation("login");
  const { isLoading, onSubmit } = props;

  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <div>
        <p className="text-center text-2xl font-normal leading-[48px] md:text-4xl">
          {t("loginForm.welcome")}
        </p>
        <p className="text-center leading-5 md:text-lg">
          {t("loginForm.signInMessage")}
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-2"
        >
          <FormField
            control={form.control}
            name="username"
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
            className="mt-6 h-12 rounded-lg text-base font-normal w-full"
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
        </form>
      </Form>
    </div>
  );
};
