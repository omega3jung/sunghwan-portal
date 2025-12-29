import { AvatarImage } from "@radix-ui/react-avatar";
import {
  Bell,
  LogOut,
  UserRound,
  UserRoundMinus,
  UserRoundPlus,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useImpersonation } from "@/hooks/useImpersonation";
import i18n from "@/lib/i18n";
import { ACCESS_LEVEL, AccessLevel, AppUser } from "@/types";
import { cn, initials } from "@/utils";

const ns = {
  ns: "UserMenu",
};

const demoNameData: Record<string, string> = {
  admin: i18n.t("adminDemo", ns),
  manager: i18n.t("managerDemo", ns),
  user: i18n.t("userDemo", ns),
  guest: i18n.t("guestDemo", ns),
};

export function UserMenu() {
  const { current } = useCurrentSession();
  const {
    actor,
    subject,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
  } = useImpersonation();

  const { t } = useTranslation("UserMenu");

  const isDemo = current.dataScope === "LOCAL";
  const canImpersonate =
    current.dataScope === "REMOTE" && actor?.canUseImpersonation;
  const hasSubject = isImpersonating && !!subject;

  const demoImpersonating = (permission: AccessLevel) => {
    const user = {
      ...actor,
      permission: permission,
    } as AppUser;

    switch (permission) {
      case ACCESS_LEVEL.ADMIN:
        user.name = demoNameData.admin;
        break;
      case ACCESS_LEVEL.MANAGER:
        user.name = demoNameData.manager;
        break;
      case ACCESS_LEVEL.USER:
        user.name = demoNameData.user;
        break;
      case ACCESS_LEVEL.GUEST:
        user.name = demoNameData.guest;
        break;
    }

    onStartImpersonating(user);
  };

  const onStartImpersonating = (user: AppUser) => {
    startImpersonation(user);
  };

  const onStopImpersonating = () => {
    stopImpersonation();
  };

  const renderUserAvatar = (
    user: AppUser | null,
    options?: { size?: number; muted?: boolean }
  ) => {
    if (!user) return null;

    const { size = 10, muted } = options ?? {};

    return (
      <Avatar className={cn(`h-${size} w-${size}`)}>
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback
          className={cn(
            muted ? "bg-muted-foreground" : "bg-foreground",
            "text-background"
          )}
        >
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
    );
  };

  const renderImpersonationAvatar = (actor: AppUser, subject: AppUser) => {
    if (!actor || !subject) return null;

    return (
      <div className="relative w-14 h-10">
        {/* actor */}
        <div className="absolute left-0 top-0">
          {renderUserAvatar(actor, { muted: true })}
        </div>

        {/* subject */}
        <div className="absolute left-4 top-0 z-10">
          {renderUserAvatar(subject)}
        </div>
      </div>
    );
  };

  const DemoImpersonation = ({ permission }: { permission: AccessLevel }) => {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{t("impersonation")}</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {permission !== ACCESS_LEVEL.ADMIN && (
              <DropdownMenuItem
                onClick={() => demoImpersonating(ACCESS_LEVEL.ADMIN)}
              >
                {t("asAdmin")}
              </DropdownMenuItem>
            )}
            {permission !== ACCESS_LEVEL.MANAGER && (
              <DropdownMenuItem
                onClick={() => demoImpersonating(ACCESS_LEVEL.MANAGER)}
              >
                {t("asManager")}
              </DropdownMenuItem>
            )}
            {permission !== ACCESS_LEVEL.USER && (
              <DropdownMenuItem
                onClick={() => demoImpersonating(ACCESS_LEVEL.USER)}
              >
                {t("asUser")}
              </DropdownMenuItem>
            )}
            {permission !== ACCESS_LEVEL.GUEST && (
              <DropdownMenuItem
                onClick={() => demoImpersonating(ACCESS_LEVEL.GUEST)}
              >
                {t("asGuest")}
              </DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-20">
          {hasSubject
            ? renderImpersonationAvatar(actor, subject)
            : renderUserAvatar(actor)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 mt-2 mr-1" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex gap-2">
            {renderUserAvatar(actor, {
              muted: hasSubject,
            })}
            <div className="flex flex-col">
              <span>{actor?.name}</span>
              <span className="text-muted-foreground font-normal">
                {actor?.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <UserRound />
              {t("myProfile")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              {t("myActivities")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              {t("notifications")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut />
            {t("logOut")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {hasSubject && subject && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex gap-2">
              {renderUserAvatar(subject)}
              <div className="flex flex-col">
                <span>{subject.name}</span>
                <span className="text-muted-foreground font-normal">
                  {subject.email}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {isDemo && <DemoImpersonation permission={subject.permission} />}

            <DropdownMenuItem onClick={onStopImpersonating}>
              <UserRoundMinus />
              {t("stopImpersonation")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {!hasSubject && isDemo && actor && (
          <DemoImpersonation permission={actor.permission} />
        )}

        {!hasSubject && canImpersonate && (
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <UserRoundPlus />
              {t("startImpersonation")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
