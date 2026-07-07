"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/shared/utils/presentation";

import type { NavigationBreadcrumbDropdownItem } from "../types";

type BreadcrumbDropdownProps = {
  isCurrentPage?: boolean;
  items: NavigationBreadcrumbDropdownItem[];
  label: ReactNode;
};

export function BreadcrumbDropdown({
  isCurrentPage = false,
  items,
  label,
}: BreadcrumbDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-current={isCurrentPage ? "page" : undefined}
          className={cn(
            "group inline-flex min-w-0 items-center gap-1.5 rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isCurrentPage ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5">{label}</span>
          <ChevronDown className="size-3 shrink-0 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-48">
        {items.map((item) => {
          const content = <span className="truncate">{item.label}</span>;

          if (item.disabled) {
            return (
              <DropdownMenuItem
                key={item.id}
                disabled
                className="font-medium text-foreground"
              >
                {content}
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuItem key={item.id} asChild>
              <Link href={item.href} className="min-w-0">
                {content}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
