import { UsersRound } from "lucide-react";
import { useMemo } from "react";
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
import { clientProfiles, internalProfiles } from "@/mocks/domain/user";
import { cn } from "@/shared/utils/presentation";

import { getDisplayNameKey, getPermissionIcon } from "./utils";

type Props = {
  user: AppUser;
  disabled: boolean;
  onDemoUserSwitch: (user: AppUser) => Promise<void>;
};

export function DemoUserSwitch(props: Props) {
  const { user, disabled, onDemoUserSwitch } = props;

  const { t } = useTranslation("UserMenu");

  const switchDemoUserProfiles = useMemo<AppUser[]>(() => {
    return internalProfiles.filter((profile) => profile.id !== user.id);
  }, [user.id]);

  const switchClientUserProfiles = useMemo<AppUser[]>(() => {
    return clientProfiles.filter((profile) => profile.id !== user.id);
  }, [user.id]);

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
          {switchDemoUserProfiles.map((profile) => {
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
          {switchClientUserProfiles.map((profile) => {
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
