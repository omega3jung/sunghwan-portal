"use client";

import Link from "next/link";
import { type ComponentProps, useRef } from "react";

import { useOptionalRouteLoading } from "./RouteLoadingProvider";

/** Next Link owns navigation filtering; report only accepted client-side navigation. */
export function RouteLoadingLink({ onClick, onNavigate, ...props }: ComponentProps<typeof Link>) {
  const loading = useOptionalRouteLoading();
  const clickedHref = useRef<string | null>(null);

  return (
    <Link
      {...props}
      onClick={(event) => {
        // Read the resolved anchor URL, including object hrefs, without duplicating Next's formatter.
        clickedHref.current = event.currentTarget.href;
        onClick?.(event);
      }}
      onNavigate={(event) => {
        let prevented = false;
        onNavigate?.({
          preventDefault: () => {
            prevented = true;
            event.preventDefault();
          },
        });
        if (prevented || props["aria-disabled"] === true || props["aria-disabled"] === "true") return;
        if (clickedHref.current) loading?.startRouteLoadingForHref(clickedHref.current);
      }}
    />
  );
}
