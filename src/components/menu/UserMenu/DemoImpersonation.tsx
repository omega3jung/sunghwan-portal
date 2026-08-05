import { ShieldUser } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthUser } from "@/domain/auth";
import { NS } from "@/lib/application/i18n";

import { getDisplayNameKey, getPermissionIcon } from "./utils";

type Props = {
  internalCandidates: AuthUser[];
  clientCandidates: AuthUser[];
  isImpersonating: boolean;
  onDemoImpersonate: (impersonatedUsername: string) => Promise<void>;
};

export function DemoImpersonation(props: Props) {
  const {
    internalCandidates,
    clientCandidates,
    isImpersonating,
    onDemoImpersonate,
  } = props;

  const { t } = useTranslation(NS.auth, { keyPrefix: "userMenu" });

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ShieldUser />
        {!isImpersonating
          ? t("impersonation.demoLabel")
          : t("impersonation.switch")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("internalUserLabel")}</DropdownMenuLabel>
            {internalCandidates.map((profile) => {
              const profileDisplayNameKey = getDisplayNameKey(
                profile.displayName,
              );
              return (
                <DropdownMenuItem
                  key={`impersonate_${profile.username}`}
                  onClick={() => onDemoImpersonate(profile.username)}
                >
                  {getPermissionIcon(profile.permission)}
                  {t(`impersonation.options.${profileDisplayNameKey}`)}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>{t("clientUserLabel")}</DropdownMenuLabel>
            {clientCandidates.map((profile) => {
              const profileDisplayNameKey = getDisplayNameKey(
                profile.displayName,
              );
              return (
                <DropdownMenuItem
                  key={`impersonate_${profile.username}`}
                  onClick={() => onDemoImpersonate(profile.username)}
                >
                  {getPermissionIcon(profile.permission)}
                  {t(`impersonation.options.${profileDisplayNameKey}`)}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
