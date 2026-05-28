import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { AppUser } from "@/domain/user";
import { clientAuths } from "@/mocks/domain/user";

import { getDisplayNameKey, getPermissionIcon } from "./utils";

type Props = {
  user: AppUser;
  onDemoImpersonate: (impersonatedUsername: string) => Promise<void>;
};

export function DemoImpersonation(props: Props) {
  const { user, onDemoImpersonate } = props;

  const { t } = useTranslation("UserMenu");

  const impersonationCandidates = useMemo(() => {
    return clientAuths.filter((profile) => profile.username !== user.username);
  }, [user.username]);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {t("demoUserImpersonation")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {impersonationCandidates.map((profile) => {
            const profileDisplayNameKey = getDisplayNameKey(
              profile.displayName,
            );
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
