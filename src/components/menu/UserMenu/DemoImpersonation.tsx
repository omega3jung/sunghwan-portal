import { ShieldUser } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { clientAuths, internalAuths } from "@/mocks/domain/user";

import { getDisplayNameKey, getPermissionIcon } from "./utils";

type Props = {
  user: AppUser;
  impersonatedUser: AppUser | null;
  onDemoImpersonate: (impersonatedUsername: string) => Promise<void>;
};

export function DemoImpersonation(props: Props) {
  const { user, onDemoImpersonate, impersonatedUser } = props;

  const { t } = useTranslation("UserMenu");

  const filterUser = useCallback(
    (username: string): boolean => {
      if (!impersonatedUser) {
        return username !== user.username;
      }
      return (
        username !== user.username && username !== impersonatedUser.username
      );
    },
    [impersonatedUser, user.username],
  );

  const impersonationDemoCandidates = useMemo<AuthUser[]>(() => {
    return internalAuths.filter((auth) => filterUser(auth.username));
  }, [filterUser]);

  const impersonationClientCandidates = useMemo<AuthUser[]>(() => {
    return clientAuths.filter((auth) => filterUser(auth.username));
  }, []);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ShieldUser />
        {!impersonatedUser
          ? t("demoUserImpersonation")
          : t("switchImpersonation")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuLabel>{t("internalUserLabel")}</DropdownMenuLabel>
          {impersonationDemoCandidates.map((profile) => {
            const profileDisplayNameKey = getDisplayNameKey(
              profile.displayName,
            );
            return (
              <DropdownMenuItem
                key={`impersonate_${profile.username}`}
                onClick={() => onDemoImpersonate(profile.username)}
              >
                {getPermissionIcon(profile.permission)}
                {t(`impersonation${profileDisplayNameKey}`)}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("clientUserLabel")}</DropdownMenuLabel>
          {impersonationClientCandidates.map((profile) => {
            const profileDisplayNameKey = getDisplayNameKey(
              profile.displayName,
            );
            return (
              <DropdownMenuItem
                key={`impersonate_${profile.username}`}
                onClick={() => onDemoImpersonate(profile.username)}
              >
                {getPermissionIcon(profile.permission)}
                {t(`impersonation${profileDisplayNameKey}`)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
