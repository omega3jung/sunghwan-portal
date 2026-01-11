import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { demoProfiles, tenantProfiles } from "@/domain/user";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { AppUser } from "@/types";

export const DemoUserSwitch = ({ disabled = false }: { disabled: boolean }) => {
  const [hasSignedIn, setHasSignedIn] = useState(false);
  const { current } = useCurrentSession();

  const { t } = useTranslation("UserMenu");
  const demoUserProfiles = [...demoProfiles, ...tenantProfiles];

  const onDemoUserSwitch = async (profile: AppUser) => {
    // loggin in.
    if (hasSignedIn) return;

    try {
      const result = await signIn("credentials", {
        username: profile.id,
        password: profile.id,
        redirect: false,
      });

      // handle error.
      if (!result?.ok) {
        throw result?.error;
      }

      setHasSignedIn(true);
    } catch (error) {
      toast(t("errors.title"), {
        description: "login switch error",
      });
    }
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={disabled}>
        {t("userSwitch")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {demoUserProfiles.map((profile) => {
            return (
              current.user?.id !== profile.id && (
                <DropdownMenuItem
                  key={profile.id}
                  onClick={() => onDemoUserSwitch(profile)}
                >
                  {t(`loginAs${profile.id}`)}
                </DropdownMenuItem>
              )
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};

export function DemoImpersonation() {
  const session = useSession();
  const { current } = useCurrentSession();

  const { t } = useTranslation("UserMenu");

  const onDemoImpersonate = async (user: AppUser) => {
    await fetch("/api/auth/impersonation/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId: user.id }),
    });

    // next-auth session refresh
    await session.update(); // useSession().update()
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{t("impersonation")}</DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {tenantProfiles.map((profile) => {
            return (
              current.user?.id !== profile.id && (
                <DropdownMenuItem onClick={() => onDemoImpersonate(profile)}>
                  {t(`impersonationAs${profile.id}`)}
                </DropdownMenuItem>
              )
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
