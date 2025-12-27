import { ChevronRight, LucideIcon, LucideProps, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactElement, ReactNode, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import ShieldBadge from "./ShieldBadge";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useImpersonation } from "@/hooks/useImpersonation";
import { useLeftMenuStore } from "@/lib/leftMenuStore";
import { cn } from "@/lib/utils";
import { LinkBarItem, LinksBar } from "./LinksBar";
import { UserMenu } from "@/components/menu/UserMenu";
import { Separator } from "@/components/ui/separator";

export type NavbarLink = {
  name: ReactNode;
  icon?: ReactElement<LucideProps>;
  url?: string;
};

type Props = {
  tabs?: LinkBarItem[];
  className?: string;
  title?: string;
  module?: string;
  openSide?: VoidFunction;
  isSideOpen?: boolean;
  actions?: ReactNode;
  pathRoute?: NavbarLink[];
  userRoleBadge?: string;
};

export const useBreadcrumbs = () => {
  const pathName = usePathname();
  const query = pathName.split("/");

  const breadCrumbs = query.map((item, i, arr) => ({
    name: item.replace(/-/gi, " "),
    url: arr.slice(0, i + 1).join("/"),
  }));

  breadCrumbs.shift();
  breadCrumbs.pop();

  return breadCrumbs;
};

export const NavigationBar = (props: Props) => {
  const { update, isOpen: isOpenStore } = useLeftMenuStore();
  const { effective, isImpersonating } = useImpersonation();
  const pathName = usePathname();

  // remove after once ojet gets deprecated
  // const screenName = ORACLE_ROUTES[pathName as RouteKey];
  // remove after once ojet gets deprecated


  const {
    title: componentTitle,
    tabs,
    //openSide: open,
    actions,
    userRoleBadge,
  } = props;

  const title = useMemo(() => {
    if (componentTitle && !componentTitle.includes("{title}")) {
      return componentTitle;
    }

    const last = pathName?.split("/")?.pop();

    if (!last) {
      return "";
    }

    if (last === "change-management-system") {
      return "Service Hub";
    }

    const words = last.replace(/-/gi, " ");

    if (componentTitle?.includes("{title}")) {
      return componentTitle.replace("{title}", words);
    }

    return words;
  }, [pathName, componentTitle]);

  const changeStoreIsOpen = () => {
    update(true);
  };

  const setLinkbarData = () => {
    if (!props.pathRoute) {
      return <></>;
    }

    if (props.pathRoute.length === 1 && props.pathRoute[0].name === title) {
      return (
        props.pathRoute[0]?.icon &&
        React.isValidElement<LucideIcon>(props.pathRoute[0]?.icon) &&
        React.cloneElement(props.pathRoute[0]?.icon, {
          className: cn(
            "w-5 h-5 mr-1",
            props.pathRoute[0]?.icon?.props.className
          ),
        })
      );
    }

    return props.pathRoute.map((route, index) => {
      const navElement = (
        <>
          <span
            className={cn(
              "mr-3.5 hidden text-cell dark:text-label-title sm:block",
              route.icon && "ms-1"
            )}
          >
            {route.name}
          </span>
          <span
            className={cn(
              "mr-3.5 text-cell dark:text-label-title sm:hidden",
              route.icon && "ms-1"
            )}
          >
            ...
          </span>
        </>
      );

      return (
        <div
          key={index}
          className="flex items-center capitalize text-cell dark:text-label-title"
        >
          {route?.icon &&
            React.isValidElement<LucideIcon>(route?.icon) &&
            React.cloneElement(route?.icon, { className: "w-5 h-5 mr-1" })}
          {route.url ? <Link href={route.url}>{navElement}</Link> : navElement}
          <span> / </span>
        </div>
      );
    });
  };

  return (
    <nav
      data-testid="screen-navigation-bar"
      className={cn(
        "col-span-full flex items-center gap-3 border-b px-2  md:col-start-2",
        props.className
      )}
    >
      <Button
        variant="ghost"
        onClick={changeStoreIsOpen}
        className="m-0 p-0 md:hidden"
      >
        <Menu />
      </Button>

      {!isOpenStore && !pathName.startsWith("/reports") && (
        <Button
          variant="ghost"
          onClick={changeStoreIsOpen}
          className="m-0 hidden p-0 md:inline-block"
        >
          <ChevronRight size="16" />
        </Button>
      )}

      {setLinkbarData()}

      <h2 className="flex w-fit text-base font-bold capitalize dark:text-label-title">
        {title}
        <ShieldBadge
          badgeText={
            userRoleBadge ?? !isImpersonating ? "Owner" : effective?.name ?? ""
          }
          shieldText={userRoleBadge}
          viewOnly={false}
          size={"12"}
          absoluteStrokeWidth={true}
          strokeWidth={1.5}
        />
      </h2>

      <div className="grow"></div>
      {!!tabs?.length && <LinksBar items={tabs} />}

      {!!actions && <div className="flex h-full items-center">{actions}</div>}
      <Separator orientation="vertical" className="my-2"/>
      <UserMenu></UserMenu>
    </nav>
  );
};
