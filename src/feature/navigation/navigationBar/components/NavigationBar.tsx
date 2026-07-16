"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ResetDemoMenu } from "@/components/menu/ResetDemoMenu";
import { UserMenu } from "@/components/menu/UserMenu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useCurrentSession } from "@/feature/auth/session/client";
import { useLeftMenuQuery } from "@/feature/navigation/leftMenu/client";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import { useNavigationBarContext } from "../context/NavigationBarContext";
import { useNavigationBreadcrumbs } from "../hooks/useNavigationBreadcrumbs";
import type { NavigationBarProps } from "../types";
import { buildBreadcrumbItems } from "../utils/buildBreadcrumbItems";
import { AppBreadcrumb } from "./AppBreadcrumb";
import { LinksBar } from "./LinksBar";

export function NavigationBar(props: NavigationBarProps) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const { data: currentSession } = useCurrentSession();
  const { data: leftMenu, isSuccess: isLeftMenuSuccess } = useLeftMenuQuery();
  const { t } = useTranslation(NS.common);
  const { currentLabel, pathname: currentLabelPathname } =
    useNavigationBarContext();
  const pathname = usePathname();
  const isLocal = currentSession?.user.dataScope === "LOCAL";
  const homeLabel = t("navigation.home");

  const breadcrumbItems = useMemo(
    () =>
      buildBreadcrumbItems({
        breadcrumbs: props.breadcrumbs,
        homeLabel,
        pathname,
        title: props.title,
      }),
    [homeLabel, pathname, props.breadcrumbs, props.title],
  );

  const visibleBreadcrumbItems = useNavigationBreadcrumbs({
    currentLabel,
    currentLabelPathname,
    enabled: props.breadcrumbs === undefined && isLeftMenuSuccess,
    fallbackItems: breadcrumbItems,
    leftMenu,
    pathname,
  });

  const openSidebar = () => {
    if (isMobile) {
      setOpenMobile(true);
      return;
    }

    setOpen(true);
  };

  return (
    <nav
      data-testid="screen-navigation-bar"
      className={cn(
        "col-span-full flex items-center gap-3 border-b pl-6 pr-2 md:col-start-2",
        props.className,
      )}
    >
      {/* open leftmenu button on mobile */}
      <Button
        variant="ghost"
        onClick={openSidebar}
        className="m-0 p-0 md:hidden"
        aria-label="Open sidebar"
      >
        <Menu />
      </Button>

      {/* breadcrumb link */}
      <AppBreadcrumb items={visibleBreadcrumbItems} />

      <div className="grow" />

      {!!props.tabs?.length && <LinksBar items={props.tabs} />}

      {!!props.actions && (
        <div className="flex h-full items-center">{props.actions}</div>
      )}

      <div className="flex h-full items-center gap-1 py-2">
        {isLocal && <ResetDemoMenu />}
        <Separator orientation="vertical" />
        <UserMenu demoCandidates={props.userMenuDemoCandidates} />
      </div>
    </nav>
  );
}
