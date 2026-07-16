import { ShieldUser } from "lucide-react";
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

  const { t } = useTranslation("UserMenu");

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ShieldUser />
        {!isImpersonating
          ? t("demoUserImpersonation")
          : t("switchImpersonation")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
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
                {t(`impersonation${profileDisplayNameKey}`)}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
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
                {t(`impersonation${profileDisplayNameKey}`)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
