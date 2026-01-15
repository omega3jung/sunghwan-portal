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
import { internalProfiles, tenantProfiles } from "@/domain/user/demo";
import { ACCESS_LEVEL, AccessLevel, AppUser, Role } from "@/types";

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

  const switchTenantUserProfiles = useMemo<AppUser[]>(() => {
    return tenantProfiles.filter((profile) => profile.id !== user.id);
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
            return (
              <DropdownMenuItem
                key={`switch_${profile.displayName.replaceAll(" ", "_")}`}
                onClick={() => onDemoUserSwitch(profile)}
              >
                {getPermissionIcon(profile.permission)}
                {t(`loginAs${profile.displayName.replaceAll(" ", "")}`)}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("tenantUserSwitchLabel")}</DropdownMenuLabel>
          {switchTenantUserProfiles.map((profile) => {
            return (
              <DropdownMenuItem
                key={`switch_${profile.displayName.replaceAll(" ", "_")}`}
                onClick={() => onDemoUserSwitch(profile)}
              >
                {getPermissionIcon(profile.permission)}
                {t(`loginAs${profile.displayName.replaceAll(" ", "")}`)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
