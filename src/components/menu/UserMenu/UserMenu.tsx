import {
  Bell,
  LogOut,
  UserRound,
  UserRoundMinus,
  UserRoundPlus,
} from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/custom/UserAvatar";
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
import { toast } from "@/components/ui/toast";
import { ACCESS_LEVEL } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { useImpersonation } from "@/feature/auth/impersonation/client";
import { useCurrentSession } from "@/feature/auth/session/client";
import { NS } from "@/lib/application/i18n";
import { useLocalizedText } from "@/lib/client/i18n";
import { cn } from "@/shared/utils/presentation";

import { DemoImpersonation } from "./DemoImpersonation";
import { DemoUserSwitch } from "./DemoUserSwitch";
import { UserImpersonation } from "./UserImpersonation";
import {
  getDemoImpersonationCandidates,
  getDemoUserSwitchCandidates,
  type UserMenuDemoCandidates,
} from "./userMenuCandidates";

type Props = {
  demoCandidates?: UserMenuDemoCandidates;
};

const EMPTY_DEMO_CANDIDATES: UserMenuDemoCandidates = {
  auths: { internal: [], client: [] },
  profiles: { internal: [], client: [] },
};

/**
 * Presents the effective identity and routes switching through either NextAuth
 * demo login or impersonation APIs. The original identity remains visible while
 * impersonating, and dialog opening waits for dropdown focus cleanup.
 */
export function UserMenu({ demoCandidates = EMPTY_DEMO_CANDIDATES }: Props) {
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
  const shouldOpenImpersonationDialogRef = useRef(false);

  const { t } = useTranslation(NS.auth, { keyPrefix: "userMenu" });
  const { t: tAuth } = useTranslation(NS.auth);
  const tLocal = useLocalizedText();

  const isDemo = current.isDemoUser;
  const visibleUser = currentUser ?? current.user;
  const displayedOriginalUser = originalUser ?? visibleUser;

  const canDemoImpersonate = useMemo(() => {
    if (!isDemo) return false;
    if (!originalUser) return false;
    if (originalUser.userScope === "CLIENT") return false;
    return originalUser.permission >= ACCESS_LEVEL.ADMIN;
  }, [isDemo, originalUser]);

  const canImpersonate = useMemo(() => {
    if (isDemo) return false;
    if (!originalUser) return false;
    return originalUser.canUseImpersonation === true;
  }, [isDemo, originalUser]);

  const hasImpersonatedUser = useMemo<boolean>(
    () => isImpersonating && !!impersonatedUser,
    [impersonatedUser, isImpersonating],
  );
  const demoUserSwitchCandidates = useMemo(
    () => getDemoUserSwitchCandidates(demoCandidates.profiles, visibleUser?.id),
    [demoCandidates.profiles, visibleUser?.id],
  );
  const demoImpersonationCandidates = useMemo(
    () =>
      getDemoImpersonationCandidates(demoCandidates.auths, [
        displayedOriginalUser?.username ?? visibleUser?.username,
        impersonatedUser?.username,
      ]),
    [
      demoCandidates.auths,
      displayedOriginalUser?.username,
      impersonatedUser?.username,
      visibleUser?.username,
    ],
  );

  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openImpersonationDialog, setOpenImpersonationDialog] =
    useState<boolean>(false);

  const handleOpenImpersonationDialog = () => {
    shouldOpenImpersonationDialogRef.current = true;
    setOpenUserMenu(false);
  };

  const onDemoUserSwitch = (profile: AppUser) => {
    return onUserSwitch({
      username: profile.username,
      password: profile.username,
      mode: "demo",
    });
  };

  const onUserSwitch = async ({
    username,
    password,
    mode = "login",
  }: {
    username: string;
    password: string;
    mode?: "login" | "demo";
  }) => {
    if (signingRef.current) return;
    signingRef.current = true;

    try {
      const result = await signIn("credentials", {
        username: username,
        password: password,
        mode,
        redirect: false,
      });

      if (!result?.ok) {
        throw result?.error;
      }

      signingRef.current = false;
    } catch {
      toast.add({
        title: tAuth("errors.title"),
        description: t("errors.switchFailed"),
        type: "error",
      });
    }
  };

  const renderUserAvatar = (
    user: AppUser | null,
    options?: { muted?: boolean },
  ) => {
    if (!user) return null;

    const { muted } = options ?? {};
    const localizedDisplayName = tLocal(user.displayName);

    return (
      <UserAvatar
        fallbackClassName={cn(
          muted ? "bg-muted-foreground" : "bg-foreground",
          "text-background",
        )}
        image={user.image}
        name={localizedDisplayName}
        size="lg"
      />
    );
  };

  const renderImpersonationAvatar = (
    originalUser: AppUser | null,
    impersonatedUser: AppUser | null,
  ) => {
    if (!originalUser || !impersonatedUser) return null;

    return (
      <div className="relative w-14 h-10">
        <div className="absolute left-0 top-0">
          {renderUserAvatar(originalUser, { muted: true })}
        </div>

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
    <>
      <DropdownMenu open={openUserMenu} onOpenChange={setOpenUserMenu}>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="w-20" />}
        >
          {hasImpersonatedUser
            ? renderImpersonationAvatar(originalUser, impersonatedUser)
            : renderUserAvatar(visibleUser)}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="p-2 mt-2 mr-1 w-full"
          align="start"
          finalFocus={() => {
            if (!shouldOpenImpersonationDialogRef.current) return true;

            // Base UI must finish closing before the dialog can safely take focus.
            window.setTimeout(() => {
              setOpenImpersonationDialog(true);
              shouldOpenImpersonationDialogRef.current = false;
            }, 0);

            return false;
          }}
        >
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
                  clientCandidates={demoUserSwitchCandidates.client}
                  canSwitchDemoUser={!isImpersonating}
                  internalCandidates={demoUserSwitchCandidates.internal}
                  onDemoUserSwitch={onDemoUserSwitch}
                />
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
            )}
            <DropdownMenuItem
              className="text-red-600/80 focus:text-red-500 data-highlighted:text-red-500"
              onClick={() => signOut()}
            >
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

              {canImpersonate && (
                <DropdownMenuItem
                  onClick={handleOpenImpersonationDialog}
                >
                  <UserRoundPlus />
                  {!impersonatedUser
                    ? t("impersonation.start")
                    : t("impersonation.switch")}
                </DropdownMenuItem>
              )}

              {canDemoImpersonate && (
                <DemoImpersonation
                  clientCandidates={demoImpersonationCandidates.client}
                  internalCandidates={demoImpersonationCandidates.internal}
                  isImpersonating={hasImpersonatedUser}
                  onDemoImpersonate={startImpersonation}
                />
              )}

              <DropdownMenuItem onClick={stopImpersonation}>
                <UserRoundMinus />
                {t("impersonation.stop")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}

          {!hasImpersonatedUser && canImpersonate && (
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleOpenImpersonationDialog}
              >
                <UserRoundPlus />
                {t("impersonation.label")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}

          {!hasImpersonatedUser && canDemoImpersonate && (
            <DemoImpersonation
              clientCandidates={demoImpersonationCandidates.client}
              internalCandidates={demoImpersonationCandidates.internal}
              isImpersonating={hasImpersonatedUser}
              onDemoImpersonate={startImpersonation}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <UserImpersonation
        username={displayedOriginalUser?.username ?? visibleUser.username}
        excludeUsernames={[
          displayedOriginalUser?.username ?? "",
          impersonatedUser?.username ?? "",
        ]}
        onUserImpersonate={async (candidate: string) => {
          await startImpersonation(candidate);
        }}
        open={openImpersonationDialog}
        onOpenChange={setOpenImpersonationDialog}
      />
    </>
  );
}
