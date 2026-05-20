import { Contact, User, UserCog, UserStar } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { ACCESS_LEVEL, AccessLevel, Role } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { clientProfiles } from "@/mocks/domain/user";
import { getLocalizedText } from "@/shared/utils/i18n";

type Props = {
  user: AppUser;
  onDemoImpersonate: (impersonatedUsername: string) => Promise<void>;
};

export function DemoImpersonation(props: Props) {
  const { user, onDemoImpersonate } = props;

  const { t } = useTranslation("UserMenu");

  const impersonationCandidates = useMemo(() => {
    return clientProfiles.filter((profile) => profile.username !== user.username);
  }, [user.username]);

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
      <DropdownMenuSubTrigger>
        {t("demoUserImpersonation")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {impersonationCandidates.map((profile) => {
            const profileDisplayNameKey = getDisplayNameKey(profile.displayName);
            return (
              <DropdownMenuItem
                key={`impersonate_${profile.username}`}
                onClick={() => onDemoImpersonate(profile.username)}
              >
                {getPermissionIcon(profile.permission)}
                {t(`impersonationAs${profileDisplayNameKey}`)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
