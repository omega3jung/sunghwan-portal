import { AvatarImage } from "@radix-ui/react-avatar";
import {
  Bell,
  LogOut,
  UserRound,
  UserRoundMinus,
  UserRoundPlus,
} from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useImpersonation } from "@/hooks/useImpersonation";
import i18n from "@/lib/i18n";
import { ACCESS_LEVEL, AppUser } from "@/types";
import { cn, initials } from "@/utils";

import { DemoImpersonation } from "./DemoImpersonation";
import { DemoUserSwitch } from "./DemoUserSwitch";

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
  const signingRef = useRef(false);

  const { t } = useTranslation("UserMenu");

  const isDemo = current.isDemoUser;

  const canDemoImpersonate = useMemo(() => {
    if (!isDemo) return false;
    if (!actor || subject) return false;
    if (actor.userScope === "TENANT") return false;
    return actor.permission >= ACCESS_LEVEL.ADMIN;
  }, [actor, isDemo, subject]);

  const canImpersonate = useMemo(() => {
    if (isDemo) return false;
    if (!actor || subject) return false;
    return actor?.canUseImpersonation === true;
  }, [actor, isDemo, subject]);

  const hasSubject = useMemo<boolean>(
    () => isImpersonating && !!subject,
    [isImpersonating, subject]
  );

  const onUserSwitch = async (profile: AppUser) => {
    // loggin in.
    if (signingRef.current) return;
    signingRef.current = true;

    try {
      const result = await signIn("credentials", {
        username: profile.id,
        password: profile.id,
        redirect: false,
      });

      // handle error.
      if (!result?.ok) {
        throw result?.error;
      }

      signingRef.current = false;
    } catch (error) {
      toast(t("errors.title"), {
        description: "login switch error",
      });
    }
  };

  const renderUserAvatar = (
    user: AppUser | null,
    options?: { size?: number; muted?: boolean }
  ) => {
    if (!user) return null;

    const { size = 10, muted } = options ?? {};

    return (
      <Avatar className={cn(`h-${size} w-${size}`)}>
        <AvatarImage src={user.image} alt={user.displayName} />
        <AvatarFallback
          className={cn(
            muted ? "bg-muted-foreground" : "bg-foreground",
            "text-background"
          )}
        >
          {initials(user.displayName)}
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

  if (!current.user) {
    return <Skeleton className="w-10 h-10 rounded-full" />;
  }

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
              <span>{actor?.displayName}</span>
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
              <DemoUserSwitch
                user={current.user}
                disabled={isImpersonating}
                onDemoUserSwitch={onUserSwitch}
              />
              <DropdownMenuSeparator />
            </DropdownMenuGroup>
          )}
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
                <span>{subject.displayName}</span>
                <span className="text-muted-foreground font-normal">
                  {subject.email}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {canDemoImpersonate && (
              <DemoImpersonation
                user={current.user}
                onDemoImpersonate={startImpersonation}
              />
            )}

            <DropdownMenuItem onClick={stopImpersonation}>
              <UserRoundMinus />
              {t("stopImpersonation")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {!hasSubject && canDemoImpersonate && (
          <DemoImpersonation
            user={current.user}
            onDemoImpersonate={startImpersonation}
          />
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
