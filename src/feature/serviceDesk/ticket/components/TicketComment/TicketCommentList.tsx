"use client";

import type { Locale } from "date-fns";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TicketComment } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";
import { stripHtml } from "@/shared/utils/comment";

import { TicketCommentEmpty } from "./TicketCommentEmpty";
import { TicketCommentItem } from "./TicketCommentItem";
import { TicketCommentListHeader } from "./TicketCommentListHeader";

type TicketCommentListProps = {
  comments?: TicketComment[];
  isLoading?: boolean;
  users?: ImageValueLabel[];
  dateLocale?: Locale;
  showHeader?: boolean;
};

export function TicketCommentList({
  comments = [],
  isLoading = false,
  users = [],
  dateLocale,
  showHeader = true,
}: TicketCommentListProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateViewport = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  const userMap = useMemo(
    () => new Map(users.map((user) => [user.value, user])),
    [users],
  );

  const activeComments = useMemo(
    () => comments.filter((comment) => comment.active),
    [comments],
  );

  const visibleComments = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const filteredComments = activeComments.filter((comment) => {
      if (!normalizedQuery) {
        return true;
      }

      const owner = userMap.get(comment.ownerId);
      const searchTarget = [
        comment.commentNo,
        t(`comment.item.visibility.${comment.visibility}`),
        stripHtml(comment.body || ""),
        owner?.label,
        owner?.displayName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchTarget.includes(normalizedQuery);
    });

    return filteredComments.sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();

      return sortOrder === "desc" ? rightTime - leftTime : leftTime - rightTime;
    });
  }, [activeComments, deferredQuery, sortOrder, t, userMap]);

  return (
    <section className="space-y-4">
      <TicketCommentListHeader
        count={activeComments.length}
        query={query}
        sortOrder={sortOrder}
        showHeader={showHeader}
        onQueryChange={setQuery}
        onToggleSort={() => {
          setSortOrder((previous) => (previous === "desc" ? "asc" : "desc"));
        }}
      />

      {isLoading ? (
        <TicketCommentEmpty type="loading" />
      ) : activeComments.length === 0 ? (
        <TicketCommentEmpty type="no-data" />
      ) : visibleComments.length === 0 ? (
        <TicketCommentEmpty type="no-result" />
      ) : (
        <div className="space-y-3">
          {visibleComments.map((comment, index) => (
            <TicketCommentItem
              key={`${comment.ticketId}-${comment.commentNo}-${isDesktop === null ? "initial" : isDesktop ? "desktop" : "mobile"}`}
              comment={comment}
              owner={userMap.get(comment.ownerId)}
              dateLocale={dateLocale}
              defaultOpen={isDesktop ? true : index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
