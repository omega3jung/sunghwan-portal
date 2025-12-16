"use client";

import { Loader2 } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { ENVIRONMENT } from "@/lib/environment";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { LoginForm } from "./components/LoginForm";
import {
  LoginStateEnum,
  LoginFormType,
  VerifyOTPFormType,
  ChangePasswordformType,
  ResetPasswordState,
} from "./types";
import { LOGIN_ERROR_CODES, LOGIN_ERROR_MESSAGES } from "./constants";
import { getToken } from "next-auth/jwt";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { updateSession: update } = useCurrentSession();

  const { t } = useTranslation("login");

  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<ResetPasswordState | null>(null);
  const [formType, setFormType] = useState<LoginStateEnum>(
    LoginStateEnum.LOGIN
  );

  const [currentID, setCurrentID] = useState<string>("");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const onSubmit = async (values: LoginFormType) => {
    setLoading(true);

    try {
      const response = await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: false,
      });

      const session = await getSession();

      if (!response?.ok || !session?.user) {
        throw response;
      }

      await update({ userId: values.username }, true);

      redirect();
    } catch (error) {
      const key = (error as { error: LOGIN_ERROR_CODES }).error;

      const { textKey, severity } =
        LOGIN_ERROR_MESSAGES[key] ?? LOGIN_ERROR_MESSAGES.default;

      if (key === LOGIN_ERROR_CODES.Expired) {
        setCurrentID(values.username);
        setFormType(LoginStateEnum.CHANGE);
      } else {
        switch (severity) {
          case "warning":
            toast.warning(t("errors.title"), {
              description: t(textKey),
            });
            break;
          case "error":
            toast.error(t("errors.title"), {
              description: t(textKey),
            });
            break;
          default:
            toast(t("errors.title"), {
              description: t(textKey),
            });
            break;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const onTryDemo = async () => {
    await update({ userId: "_demo" }, true);
    redirect();
  };

  const onVerifyOTP = async ({ username, email, otp }: VerifyOTPFormType) => {
    // verify OTP to server, for later.
    //const { resetToken } = await verifyOTPApi({ username, email, otp });

    // for demo.
    if (otp !== "123456") {
      toast.error(t("otp.invalid"));
      return;
    }

    // set reset token.
    setResetToken({ username: username, resetToken: "true" });

    // change to ChangePasswordForm with RESET type.
    setCurrentID(username);
    setFormType(LoginStateEnum.CHANGE);
  };

  const onChangePassword = async ({
    username,
    password,
  }: ChangePasswordformType) => {
    if (username !== resetToken?.username) {
      toast.error("Verified ID is different", {
        description:
          "Verified ID is different with current ID. Please verify OTP again.",
      });
      setResetToken(null);
      setFormType(LoginStateEnum.RESET);
      return;
    }

    try {
      // TODO. change password.
      //const response = await resetPassword("credentials", { username, password, resetToken });

      //if (!response?.ok || !session?.user) { throw response; }

      toast.success("Updated", {
        description: "Password has been updated.",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    } catch (error) {
      toast("Password has been changed.", {
        description: `Error code : ${error}`,
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }

    // back to login form.
    setFormType(LoginStateEnum.LOGIN);
  };

  const redirect = () => {
    const r = searchParams.get("r");
    const params = new URLSearchParams(searchParams.toString());

    params.delete("r");

    // open redirect block.
    const isSafePath = r?.startsWith("/");
    const target = isSafePath && r ? r : "/home";

    const queryString = params.toString();

    router.push(queryString ? `${target}?${queryString}` : target);
  };

  return (
    <div
      className={cn(
        "flex h-screen w-screen flex-col gap-12 p-4 md:flex-row-reverse lg:gap-32 lg:px-32",
        "bg-cover bg-bottom bg-no-repeat"
      )}
      style={{
        backgroundImage: `url(${ENVIRONMENT.BASE_PATH}/images/login/app-background.webp)`,
      }}
    >
      <div className="flex grow items-center justify-center">
        <div className="flex w-full max-w-2xl justify-center">
          <Image
            src="/images/logo_light.png"
            alt="logo"
            width={200}
            height={60}
            priority
          />
          <img
            src={`${ENVIRONMENT.BASE_PATH}/public/images/logo_light.png`}
            alt={"logo"}
          />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center text-white">
        <div className="flex w-full flex-col gap-5 rounded-lg bg-portal-background p-4 xl:w-[40rem] xl:gap-9 xl:p-10 xl:py-12">
          <div>
            <p className="mb-1 text-center text-4xl font-normal leading-[48px]">
              {formType === LoginStateEnum.LOGIN && t("welcome")}
              {formType === LoginStateEnum.CHANGE &&
                t("managePasswordDialog.reset.title")}
              {formType === LoginStateEnum.RESET &&
                t("forgotPasswordForm.title")}
            </p>
            <p className="text-center text-lg leading-5 text-white">
              {formType === LoginStateEnum.RESET &&
                t("forgotPasswordForm.message")}
              {formType !== LoginStateEnum.RESET && t("signInMessage")}
            </p>
            {formType === LoginStateEnum.RESET && (
              <p className="mt-2 text-center text-sm leading-5 text-gray-300">
                {t("forgotPasswordForm.dontHaveEmail")}
              </p>
            )}
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-2">
            {formType === LoginStateEnum.LOGIN && (
              <div>
                <LoginForm
                  onSubmit={onSubmit}
                  isLoading={loading}
                  onForgotPassword={() => setFormType(LoginStateEnum.RESET)}
                />
                <Button
                  className="mt-6 h-12 rounded-lg text-base font-normal md:w-full"
                  type="button"
                  data-testid="forgot-open"
                  onClick={onTryDemo}
                >
                  {t("loginForm.tryDemo")}
                  {loading && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
                </Button>
              </div>
            )}

            {formType === LoginStateEnum.RESET && (
              <ResetPasswordForm
                isLoading={loading}
                onSubmit={onVerifyOTP}
                onBack={() => setFormType(LoginStateEnum.LOGIN)}
              />
            )}

            {formType === LoginStateEnum.CHANGE && (
              <ChangePasswordForm
                isLoading={loading}
                username={currentID}
                onSubmit={onChangePassword}
                onBack={() => setFormType(LoginStateEnum.LOGIN)}
              />
            )}

            <div className="mt-8 flex flex-col justify-center text-center">
              <p className="mb-2 font-semibold uppercase">
                {t("loginForm.cantLogin")}
              </p>

              <p>
                {t("loginForm.connectMessage")}
                <Button variant="link" className="py-0 text-base font-normal">
                  {t("loginForm.helpCenter")}
                </Button>
              </p>

              <p>
                <Button
                  variant="link"
                  className="py-0 text-base font-normal text-white"
                >
                  {t("loginForm.privacyAndTerms")}
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
