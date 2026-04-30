"use client";

import type { Locale } from "date-fns";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TicketAction } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";
import { htmlToPlainText } from "@/shared/utils/value";

import { getTicketActionTypeLabelKey } from "../../mapper";
import { TicketActionEmpty } from "./TicketActionEmpty";
import { TicketActionItem } from "./TicketActionItem";
import { TicketActionListHeader } from "./TicketActionListHeader";

type TicketActionListProps = {
  actions?: TicketAction[];
  isLoading?: boolean;
  users?: ImageValueLabel[];
  dateLocale?: Locale;
  showHeader?: boolean;
};

export function TicketActionList({
  actions = [],
  isLoading = false,
  users = [],
  dateLocale,
  showHeader = true,
}: TicketActionListProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const userMap = useMemo(
    () => new Map(users.map((user) => [user.value, user])),
    [users],
  );

  const activeActions = useMemo(
    () => actions.filter((action) => action.active),
    [actions],
  );

  const visibleActions = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const filteredActions = activeActions.filter((action) => {
      if (!normalizedQuery) {
        return true;
      }

      const owner = userMap.get(action.ownerId);
      const searchTarget = [
        action.actionNo,
        t(getTicketActionTypeLabelKey(action.actionType)),
        htmlToPlainText(action.content || ""),
        owner?.label,
        owner?.displayName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchTarget.includes(normalizedQuery);
    });

    return filteredActions.sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();

      return sortOrder === "desc" ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [activeActions, deferredQuery, sortOrder, t, userMap]);

  return (
    <section className="space-y-4">
      <TicketActionListHeader
        count={activeActions.length}
        query={query}
        sortOrder={sortOrder}
        showHeader={showHeader}
        onQueryChange={setQuery}
        onToggleSort={() => {
          setSortOrder((previous) => (previous === "desc" ? "asc" : "desc"));
        }}
      />

      {isLoading ? (
        <TicketActionEmpty type="loading" />
      ) : activeActions.length === 0 ? (
        <TicketActionEmpty type="no-data" />
      ) : visibleActions.length === 0 ? (
        <TicketActionEmpty type="no-result" />
      ) : (
        <div className="space-y-3">
          {visibleActions.map((action, index) => (
            <TicketActionItem
              key={`${action.ticketId}-${action.actionNo}-${isDesktop === null ? "initial" : isDesktop ? "desktop" : "mobile"}`}
              action={action}
              owner={userMap.get(action.ownerId)}
              dateLocale={dateLocale}
              defaultOpen={isDesktop ? true : index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
