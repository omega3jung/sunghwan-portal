"use client";

import { Loader2 } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCurrentSession } from "@/hooks/useCurrentSession";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { status } = useSession();
  const { updateSession: update } = useCurrentSession();

  const { t } = useTranslation("login");

  const [hasSignedIn, setHasSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [resetToken, setResetToken] = useState<ResetPasswordState | null>(null);
  const [formType, setFormType] = useState<LoginStateEnum>(
    LoginStateEnum.LOGIN
  );

  const [currentID, setCurrentID] = useState<string>("");

  // set to use light style.
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  // submit from LoginForm.tsx.
  const onSubmit = (values: LoginFormType): Promise<void> => {
    setLoading(true);
    return onSignIn(values);
  };

  // try demo click.
  const onTryDemo = (): Promise<void> => {
    setDemoLoading(true);
    return onSignIn({ username: "__demo__", password: "__demo__" });
  };

  // process sign in.
  const onSignIn = async (values: LoginFormType): Promise<void> => {
    try {
      const result = await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: false,
      });

      // handle error.
      if (!result?.ok) {
        throw result?.error ?? LOGIN_ERROR_CODES.Default;
      }

      setHasSignedIn(true);
      // After logging in, if the status is authenticated, you will be redirected.
      // go to redirect, #L175.
    } catch (error) {
      setHasSignedIn(false);

      const key =
        error instanceof Error
          ? (error.message as LOGIN_ERROR_CODES)
          : LOGIN_ERROR_CODES.Default;

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
      setDemoLoading(false);
      setLoading(false);
    }
  };

  // submit from ResetPasswordForm.tsx.
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

  // submit from ChangePasswordForm.tsx.
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

  // redirect after sign in.
  const redirect = () => {
    const r = searchParams.get("r") ?? "";

    const params = new URLSearchParams(searchParams.toString());

    params.delete("r");

    // open redirect block.
    const isSafePath = r.startsWith("/");
    const target = isSafePath && r ? r : "/";

    const queryString = params.toString();

    router.push(queryString ? `${target}?${queryString}` : target);
  };

  useEffect(() => {
    if (hasSignedIn && status === "authenticated") {
      redirect();
    }
  }, [hasSignedIn, status]);

  return (
    <div className="flex w-full flex-col gap-5 rounded-lg bg-foreground/10 p-4 xl:w-[40rem] xl:gap-9 xl:p-10 xl:py-12">
      {formType === LoginStateEnum.LOGIN && (
        <div>
          <LoginForm onSubmit={onSubmit} isLoading={loading} />
          <Button
            className="mt-6 h-12 rounded-lg text-base font-normal w-full"
            type="button"
            variant={"secondary"}
            data-testid="forgot-open"
            onClick={onTryDemo}
          >
            {demoLoading ? (
              <>
                {t("loading.loggingIn")}
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              </>
            ) : (
              t("loginForm.tryDemo")
            )}
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

      <div className="mt-6 flex flex-col justify-center text-center">
        <p>
          <Button
            variant="link"
            className="py-0 text-base font-semibold uppercase"
            onClick={() => setFormType(LoginStateEnum.CHANGE)}
          >
            {t("loginForm.canNotLogin")}
          </Button>
          <Button variant="link" className="py-0 text-base font-normal">
            {t("loginForm.helpCenter")}
          </Button>
        </p>

        <p>
          <Button
            variant="link"
            className="py-0 text-base font-normal text-primary"
          >
            {t("loginForm.privacyAndTerms")}
          </Button>
        </p>
      </div>
    </div>
  );
}
