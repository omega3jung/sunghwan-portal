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
import { tenantProfiles } from "@/domain/user";
import { ACCESS_LEVEL, AccessLevel, AppUser, Role } from "@/types";

type Props = {
  user: AppUser;
  onDemoImpersonate: (userId: string) => Promise<void>;
};

export function DemoImpersonation(props: Props) {
  const { user, onDemoImpersonate } = props;

  const { t } = useTranslation("UserMenu");

  const impersonationUserProfiles = useMemo(() => {
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
      <DropdownMenuSubTrigger>
        {t("demoUserImpersonation")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {impersonationUserProfiles.map((profile) => {
            return (
              <DropdownMenuItem
                key={`impersonate_${profile.displayName.replaceAll(" ", "_")}`}
                onClick={() => onDemoImpersonate(profile.id)}
              >
                {getPermissionIcon(profile.permission)}
                {t(`impersonationAs${profile.displayName.replaceAll(" ", "")}`)}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
