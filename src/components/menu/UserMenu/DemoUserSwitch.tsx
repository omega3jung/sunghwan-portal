import { Contact, User, UserCog, UsersRound, UserStar } from "lucide-react";
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
import { ACCESS_LEVEL, AccessLevel, Role } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { clientProfiles, internalProfiles } from "@/mocks/domain/user";
import { getLocalizedText } from "@/shared/utils/i18n";

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

  const getPermissionIcon = (accessLevel: AccessLevel | Role) => {
    switch (accessLevel) {
      case "ADMIN":
      case ACCESS_LEVEL.ADMIN:
        return <UserStar />;

      case "MANAGER":
      case ACCESS_LEVEL.MANAGER:
        return <UserCog />;

      case "USER":
      case ACCESS_LEVEL.USER:
        return <User />;

      default:
        return <Contact />;
    }
  };

  const getDisplayNameKey = (displayName: AppUser["displayName"]) =>
    (getLocalizedText(displayName, "en") ?? "").replaceAll(" ", "");

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
            const profileDisplayNameKey = getDisplayNameKey(profile.displayName);
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
            const profileDisplayNameKey = getDisplayNameKey(profile.displayName);
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
