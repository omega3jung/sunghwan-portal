import { UsersRound } from "lucide-react";
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
import { AppUser } from "@/domain/user";
import { cn } from "@/shared/utils/presentation";

import { getDisplayNameKey, getPermissionIcon } from "./utils";

type Props = {
  internalCandidates: AppUser[];
  clientCandidates: AppUser[];
  disabled: boolean;
  onDemoUserSwitch: (user: AppUser) => Promise<void>;
};

export function DemoUserSwitch(props: Props) {
  const {
    internalCandidates,
    clientCandidates,
    disabled,
    onDemoUserSwitch,
  } = props;

  const { t } = useTranslation("UserMenu");

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        disabled={disabled}
        className={cn(
          disabled && "cursor-not-allowed text-muted-foreground opacity-50",
        )}
      >
        <UsersRound />
        {t("demoUserSwitch")}
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
                key={`switch_${profile.id}`}
                onClick={() => onDemoUserSwitch(profile)}
              >
                {getPermissionIcon(profile.permission)}
                {t(`login${profileDisplayNameKey}`)}
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
                key={`switch_${profile.id}`}
                onClick={() => onDemoUserSwitch(profile)}
              >
                {getPermissionIcon(profile.permission)}
                {t(`login${profileDisplayNameKey}`)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
