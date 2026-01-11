import { AvatarImage } from "@radix-ui/react-avatar";
import {
  Bell,
  LogOut,
  UserRound,
  UserRoundMinus,
  UserRoundPlus,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useImpersonation } from "@/hooks/useImpersonation";
import i18n from "@/lib/i18n";
import { ACCESS_LEVEL, AppUser } from "@/types";
import { cn, initials } from "@/utils";

import { DemoImpersonation, DemoUserSwitch } from "./DemoUserMenu";

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
  const session = useSession();

  const { current } = useCurrentSession();
  const { actor, subject, isImpersonating } = useImpersonation();

  const { t } = useTranslation("UserMenu");

  const isDemo = current.isDemoUser;

  const canDemoImpersonate = useMemo(() => {
    if (!isDemo) return false;
    if (!actor) return false;
    return actor.permission >= ACCESS_LEVEL.ADMIN;
  }, [actor, isDemo]);

  const canImpersonate = useMemo(() => {
    if (isDemo) return false;
    return actor?.canUseImpersonation === true;
  }, [actor?.canUseImpersonation, isDemo]);

  const hasSubject = useMemo<boolean>(
    () => isImpersonating && !!subject,
    [isImpersonating, subject]
  );

  const onStopImpersonating = async () => {
    await fetch("/api/auth/impersonation", {
      method: "DELETE",
    });

    await session.update();
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

  const renderImpersonationAvatar = (
    actor: AppUser | null,
    subject: AppUser | null
  ) => {
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
          {isDemo && (
            <DropdownMenuGroup>
              <DemoUserSwitch disabled={isImpersonating} />
              <DropdownMenuSeparator />
            </DropdownMenuGroup>
          )}
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

            {canDemoImpersonate && <DemoImpersonation />}

            <DropdownMenuItem onClick={onStopImpersonating}>
              <UserRoundMinus />
              {t("stopImpersonation")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {!hasSubject && canDemoImpersonate && <DemoImpersonation />}

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
