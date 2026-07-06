"use client";

import type { ReactNode } from "react";

import { useTicketUpdateFormContext } from "../../context/TicketUpdateFormContext";

type RemoteNoticeProps = {
  children: ReactNode;
  isVisible: boolean;
};

export const RemoteAttachmentNotice = ({
  children,
  isVisible,
}: RemoteNoticeProps) => {
  const { isRemoteMode } = useTicketUpdateFormContext();

  if (!isRemoteMode || !isVisible) {
    return null;
  }

  return (
    <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm leading-5 text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200">
      {children}
    </div>
  );
};

export const RoutingRecalculationNotice = ({
  children,
  isVisible,
}: RemoteNoticeProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-5 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
      {children}
    </div>
  );
};
