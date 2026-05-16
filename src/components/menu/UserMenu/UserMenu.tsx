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
import { ACCESS_LEVEL } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { useImpersonation } from "@/feature/auth/impersonation/client";
import { useCurrentSession } from "@/feature/auth/session/hooks/useCurrentSession";
import { useLocalizedText } from "@/shared/hooks";
import { cn, initials } from "@/shared/utils/presentation";

import { DemoImpersonation } from "./DemoImpersonation";
import { DemoUserSwitch } from "./DemoUserSwitch";

export function UserMenu() {
  const { current } = useCurrentSession();
  const {
    originalUser,
    impersonatedUser,
    currentUser,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
  } = useImpersonation();
  const signingRef = useRef(false);

  const { t } = useTranslation("UserMenu");
  const tLocal = useLocalizedText();

  const isDemo = current.isDemoUser;
  const visibleUser = currentUser ?? current.user;
  const displayedOriginalUser = originalUser ?? visibleUser;

  const canDemoImpersonate = useMemo(() => {
    if (!isDemo) return false;
    if (!originalUser || impersonatedUser) return false;
    if (originalUser.userScope === "CLIENT") return false;
    return originalUser.permission >= ACCESS_LEVEL.ADMIN;
  }, [impersonatedUser, isDemo, originalUser]);

  const canImpersonate = useMemo(() => {
    if (isDemo) return false;
    if (!originalUser || impersonatedUser) return false;
    return originalUser.canUseImpersonation === true;
  }, [impersonatedUser, isDemo, originalUser]);

  const hasImpersonatedUser = useMemo<boolean>(
    () => isImpersonating && !!impersonatedUser,
    [impersonatedUser, isImpersonating],
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
    options?: { size?: number; muted?: boolean },
  ) => {
    if (!user) return null;

    const { size = 10, muted } = options ?? {};
    const localizedDisplayName = tLocal(user.displayName);

    return (
      <Avatar className={cn(`h-${size} w-${size}`)}>
        <AvatarImage src={user.image} alt={localizedDisplayName} />
        <AvatarFallback
          className={cn(
            muted ? "bg-muted-foreground" : "bg-foreground",
            "text-background",
          )}
        >
          {initials(localizedDisplayName)}
        </AvatarFallback>
      </Avatar>
    );
  };

  const renderImpersonationAvatar = (
    originalUser: AppUser | null,
    impersonatedUser: AppUser | null,
  ) => {
    if (!originalUser || !impersonatedUser) return null;

    return (
      <div className="relative w-14 h-10">
        {/* original user */}
        <div className="absolute left-0 top-0">
          {renderUserAvatar(originalUser, { muted: true })}
        </div>

        {/* impersonated user */}
        <div className="absolute left-4 top-0 z-10">
          {renderUserAvatar(impersonatedUser)}
        </div>
      </div>
    );
  };

  if (!visibleUser) {
    return <Skeleton className="w-10 h-10 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-20">
          {hasImpersonatedUser
            ? renderImpersonationAvatar(originalUser, impersonatedUser)
            : renderUserAvatar(visibleUser)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 mt-2 mr-1" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex gap-2">
            {renderUserAvatar(displayedOriginalUser, {
              muted: hasImpersonatedUser,
            })}
            <div className="flex flex-col">
              <span>
                {displayedOriginalUser
                  ? tLocal(displayedOriginalUser.displayName)
                  : ""}
              </span>
              <span className="text-muted-foreground font-normal">
                {displayedOriginalUser?.email}
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
                user={visibleUser}
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

        {hasImpersonatedUser && impersonatedUser && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex gap-2">
              {renderUserAvatar(impersonatedUser)}
              <div className="flex flex-col">
                <span>{tLocal(impersonatedUser.displayName)}</span>
                <span className="text-muted-foreground font-normal">
                  {impersonatedUser.email}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {canDemoImpersonate && (
              <DemoImpersonation
                user={visibleUser}
                onDemoImpersonate={startImpersonation}
              />
            )}

            <DropdownMenuItem onClick={stopImpersonation}>
              <UserRoundMinus />
              {t("stopImpersonation")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {!hasImpersonatedUser && canDemoImpersonate && (
          <DemoImpersonation
            user={visibleUser}
            onDemoImpersonate={startImpersonation}
          />
        )}

        {!hasImpersonatedUser && canImpersonate && (
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
