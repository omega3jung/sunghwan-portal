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
      <DropdownMenuSubTrigger disabled={disabled}>
        <UsersRound />
        {t("demoUserSwitch")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuLabel>{t("internalUserSwitchLabel")}</DropdownMenuLabel>
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
                {t(`loginAs${profileDisplayNameKey}`)}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("clientUserSwitchLabel")}</DropdownMenuLabel>
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
                {t(`loginAs${profileDisplayNameKey}`)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
