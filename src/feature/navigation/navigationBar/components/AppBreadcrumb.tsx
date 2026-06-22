import Link from "next/link";
import { cloneElement, Fragment, isValidElement } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/shared/utils/presentation";

import type { NavigationBreadcrumbItem } from "../types";

type AppBreadcrumbProps = {
  items: NavigationBreadcrumbItem[];
};
export function AppBreadcrumb({ items }: AppBreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap text-sm">
        {items.map((item, index) => {
          const isCurrentPage = index === items.length - 1;

          const content = (
            <>
              {isValidElement(item.icon) &&
                cloneElement(item.icon, {
                  className: cn(
                    "h-4 w-4 shrink-0",
                    isCurrentPage ? "text-foreground" : "text-muted-foreground",
                    item.icon.props.className,
                  ),
                })}

              <span
                className={cn(
                  "truncate",
                  isCurrentPage
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </>
          );

          return (
            <Fragment key={index}>
              <BreadcrumbItem className="min-w-0">
                {isCurrentPage ? (
                  <BreadcrumbPage className="flex min-w-0 items-center gap-1.5">
                    {content}
                  </BreadcrumbPage>
                ) : !item.href ? (
                  <span className="flex min-w-0 items-center gap-1.5">
                    {content}
                  </span>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className="flex min-w-0 items-center gap-1.5 transition-colors hover:text-foreground"
                    >
                      {content}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isCurrentPage && (
                <BreadcrumbSeparator className="text-muted-foreground/70" />
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
