import type { ReactNode } from "react";

import type { NavigationBarProps, NavigationBreadcrumbItem } from "../types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toLabel(segment: string) {
  if (UUID_PATTERN.test(segment)) {
    return "Ticket Detail";
  }

  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function getPathnameItems(pathname: string): NavigationBreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => ({
    label: toLabel(segment),
    href:
      index < segments.length - 1
        ? `/${segments.slice(0, index + 1).join("/")}`
        : undefined,
  }));
}

function resolveTitle(title: ReactNode, fallbackLabel?: ReactNode) {
  if (typeof title !== "string" || !title.includes("{title}")) {
    return title;
  }

  return title.replace(
    "{title}",
    typeof fallbackLabel === "string" ? fallbackLabel : "",
  );
}

type BuildBreadcrumbItemsOptions = Pick<
  NavigationBarProps,
  "breadcrumbs" | "title"
> & {
  homeLabel?: ReactNode;
  pathname: string;
};

export function buildBreadcrumbItems({
  breadcrumbs,
  homeLabel = "Home",
  pathname,
  title,
}: BuildBreadcrumbItemsOptions): NavigationBreadcrumbItem[] {
  if (breadcrumbs !== undefined) {
    return breadcrumbs;
  }

  const pathnameItems = getPathnameItems(pathname);
  const fallbackLabel = pathnameItems.at(-1)?.label;
  const pageTitle = resolveTitle(title ?? fallbackLabel, fallbackLabel);

  if (pathnameItems.length === 0) {
    return [{ label: pageTitle ?? homeLabel }];
  }

  if (title == null) {
    return pathnameItems;
  }

  return pathnameItems.map((item, index) =>
    index === pathnameItems.length - 1 ? { ...item, label: pageTitle } : item,
  );
}
